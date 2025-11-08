'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface Position {
  id: string;
  marketTitle: string;
  side: 'yes' | 'no';
  shares: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
}

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const currentValue = position.shares * (position.currentPrice / 100);
  const pnl = currentValue - position.invested;
  const pnlPercentage = ((pnl / position.invested) * 100).toFixed(2);
  const isProfit = pnl >= 0;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-3 shadow-sm pixel-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-[var(--text-primary)] mb-1 leading-tight text-sm">{position.marketTitle}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${
              position.side === 'yes' 
                ? 'bg-gradient-to-r from-green-400/20 to-emerald-500/20 text-green-700 dark:text-green-300 border border-green-500/30' 
                : 'bg-gradient-to-r from-red-400/20 to-pink-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
            }`}>
              {position.side.toUpperCase()}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-medium">{position.shares} shares</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
        <div>
          <div className="text-[10px] text-[var(--text-muted)] mb-0.5 uppercase tracking-wider font-bold">Avg</div>
          <div className="text-[var(--text-primary)] font-bold">{position.avgPrice}¢</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--text-muted)] mb-0.5 uppercase tracking-wider font-bold">Now</div>
          <div className="text-[var(--text-primary)] font-bold">{position.currentPrice}¢</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--text-muted)] mb-0.5 uppercase tracking-wider font-bold">Invested</div>
          <div className="text-[var(--text-primary)] font-bold">${position.invested}</div>
        </div>
      </div>

      {/* PnL */}
      <div className={`flex items-center justify-between p-2.5 rounded-2xl pixel-shadow ${
        isProfit 
          ? 'bg-gradient-to-r from-green-400/20 to-emerald-500/20 border border-green-500/30' 
          : 'bg-gradient-to-r from-red-400/20 to-pink-500/20 border border-red-500/30'
      }`}>
        <div className="flex items-center gap-1.5">
          {isProfit ? (
            <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          )}
          <span className={`text-xs font-bold ${isProfit ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            {isProfit ? '+' : ''}{pnlPercentage}%
          </span>
        </div>
        <div className={`text-sm font-bold ${isProfit ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
          {isProfit ? '+' : ''}${pnl.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

