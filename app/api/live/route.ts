import { NextRequest, NextResponse } from 'next/server';
import { getLiveScores } from '@/lib/sports';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get('sport') || 'soccer';

    // Fetch live scores from API
    const liveScores = await getLiveScores(sport);

    // Update Supabase live_events table
    for (const score of liveScores) {
      await supabase.from('live_events').upsert(
        {
          sport,
          score: {
            home: score.score.home,
            away: score.score.away,
            teams: score.teams,
          },
          status: score.status,
          external_id: score.id.toString(),
        },
        {
          onConflict: 'external_id',
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: liveScores,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live scores' },
      { status: 500 }
    );
  }
}

