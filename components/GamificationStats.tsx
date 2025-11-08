'use client';

import { Trophy, Zap, Target, Flame } from 'lucide-react';

interface GamificationStatsProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  rank: number;
}

export function GamificationStats({ level, xp, xpToNextLevel, streak, rank }: GamificationStatsProps) {
  const progress = (xp / xpToNextLevel) * 100;

  return (
    <div className="px-4 mb-2.5">
      {/* Level and XP Card */}
      <div className="gamification-level-card rounded-3xl p-4 text-white shadow-lg mb-2 pixel-shadow relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <Trophy className="w-5 h-5" style={{ color: 'var(--accent-gold)' }} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-bold opacity-90">Level</div>
                <div className="text-xl font-bold">{level}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider font-bold opacity-90">XP</div>
              <div className="font-bold">{xp}/{xpToNextLevel}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
            <div 
              className="gamification-progress rounded-full transition-all duration-1000 ease-out pixel-btn"
              style={{ width: `${progress}%`, height: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="gamification-stat-card rounded-2xl p-2.5 text-white pixel-shadow">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-1.5">
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-90">Streak</div>
          <div className="font-bold text-sm">{streak} days</div>
        </div>

        <div className="gamification-stat-card rounded-2xl p-2.5 text-white pixel-shadow" style={{ background: 'var(--color-secondary)' }}>
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-1.5">
            <Target className="w-4 h-4" />
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-90">Rank</div>
          <div className="font-bold text-sm">#{rank}</div>
        </div>

        <div className="gamification-stat-card rounded-2xl p-2.5 text-white pixel-shadow" style={{ background: 'var(--color-tertiary)' }}>
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-1.5">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-90">Power</div>
          <div className="font-bold text-sm">Elite</div>
        </div>
      </div>
    </div>
  );
}

