'use client';

import { useEffect, useState } from 'react';
import { getLiveScores, type LiveFixture } from '@/lib/sports';
import { subscribeToLiveEvents, type LiveEvent } from '@/lib/supabase';

interface LiveScoresProps {
  sport: string;
}

export function LiveScores({ sport }: LiveScoresProps) {
  const [scores, setScores] = useState<LiveFixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      const liveScores = await getLiveScores(sport);
      setScores(liveScores);
      setLoading(false);
    };

    fetchScores();
    const interval = setInterval(fetchScores, 30000); // Poll every 30s

    // Subscribe to Supabase realtime updates
    const unsubscribe = subscribeToLiveEvents(sport, (event: LiveEvent) => {
      setScores((prev) => {
        const existing = prev.find((s) => s.id === parseInt(event.id.toString()));
        if (existing) {
          return prev.map((s) =>
            s.id === parseInt(event.id.toString())
              ? {
                  ...s,
                  score: event.score,
                  status: event.status,
                }
              : s
          );
        }
        return prev;
      });
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [sport]);

  if (loading) {
    return (
      <div className="card-modern p-6 sticky top-24">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="spinner mb-3"></div>
          <div className="text-gray-500 text-sm">Loading scores...</div>
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="card-modern p-6 sticky top-24">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">
            Live Scores
          </h3>
          <span className="text-sm font-medium text-gray-400 capitalize">{sport}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-3xl mb-2">📺</div>
          <p className="text-sm text-gray-500">No live games right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern p-6 sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900">
          Live Scores
        </h3>
        <span className="status-live capitalize">{sport}</span>
      </div>
      <div className="space-y-3">
        {scores.map((fixture) => (
          <div
            key={fixture.id}
            className="rounded-xl p-4 border border-gray-200 bg-gray-50"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm truncate">{fixture.teams.home}</div>
                <div className="text-xs text-gray-400 my-1">vs</div>
                <div className="font-semibold text-gray-800 text-sm truncate">{fixture.teams.away}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-bold text-indigo-600 tabular-nums">
                  {fixture.score.home} - {fixture.score.away}
                </div>
                <div className="text-xs text-gray-500 font-semibold mt-1 uppercase">{fixture.status}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

