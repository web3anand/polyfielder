// Groq API calls are now handled server-side via /api/analyze-odds
// This keeps the API key secure and prevents browser exposure

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

/**
 * Analyze odds using Groq LLM (server-side API call)
 * This keeps the Groq API key secure on the server
 */
export const analyzeOdds = async (
  marketData: MarketData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  histData: any[],
  _histQuery?: string
): Promise<OddsAnalysis> => {
  try {
    const response = await fetch('/api/analyze-odds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        marketData,
        histData,
        histQuery: _histQuery,
      }),
    });

    const data = await response.json();

    if (data.success && data.analysis) {
      return data.analysis;
    }

    // Return default analysis on error
    return {
      trueProb: 0.5,
      EV: 0,
      bet: {
        side: 'YES',
        amount: '$0',
        price: marketData.odds.yes.toString(),
      },
      rationale: data.error || 'Error generating analysis. Please try again.',
    };
  } catch (error) {
    // Return default analysis on error
    return {
      trueProb: 0.5,
      EV: 0,
      bet: {
        side: 'YES',
        amount: '$0',
        price: marketData.odds.yes.toString(),
      },
      rationale: 'Error generating analysis. Please try again.',
    };
  }
};

export const searchHistorical = async (
  _sport: string,
  _query: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> => {
  // This would call the sports API to get historical data
  // For now, return a placeholder that indicates the search was performed
  return [];
};

