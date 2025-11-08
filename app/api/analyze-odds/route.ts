import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export interface OddsAnalysis {
  trueProb: number;
  EV: number;
  bet: {
    side: 'YES' | 'NO';
    amount: string;
    price: string;
  };
  rationale: string;
}

export interface MarketData {
  question: string;
  liquidity: number;
  odds: {
    yes: number;
    no: number;
  };
  marketId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { marketData, histData, histQuery } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const histContext = histData?.length > 0
      ? JSON.stringify(histData.slice(0, 10)) // Limit to top 10 results
      : 'No historical data available';

    const prompt = `You are an expert sports betting analyst. Analyze this Polymarket prediction market:

Market Question: ${marketData.question}
Current Liquidity: $${marketData.liquidity.toLocaleString()}
Current Odds: YES @$${marketData.odds.yes.toFixed(2)}, NO @$${marketData.odds.no.toFixed(2)}

${histQuery ? `Historical Context Query: "${histQuery}"` : ''}
Historical Data: ${histContext}

Provide a detailed analysis with:
1. True probability assessment (0-1)
2. Expected Value (EV) calculation
3. Recommended bet: side (YES/NO), amount ($), and target price
4. Rationale explaining your reasoning

Format your response as JSON:
{
  "trueProb": 0.55,
  "EV": 0.12,
  "bet": {
    "side": "YES",
    "amount": "$100",
    "price": "0.40"
  },
  "rationale": "Detailed explanation based on historical patterns and current market conditions..."
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional sports betting analyst specializing in prediction markets. Provide accurate, data-driven analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from Groq');
    }

    const analysis = JSON.parse(content) as OddsAnalysis;
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze odds',
        // Return default analysis on error
        analysis: {
          trueProb: 0.5,
          EV: 0,
          bet: {
            side: 'YES' as const,
            amount: '$0',
            price: '0.50',
          },
          rationale: 'Error generating analysis. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}

