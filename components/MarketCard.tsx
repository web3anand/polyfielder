'use client';

import { memo, useState, useEffect, useMemo } from 'react';
import { BettingModal } from './BettingModal';
import { AnimatedNumber } from './AnimatedNumber';

interface MarketCardProps {
  market: {
    id: string;
    question: string;
    liquidity?: number;
    odds: { yes: number; no: number };
    sport?: string;
    endDate?: string;
    imageUrl?: string;
  };
  onBet: (marketId: string, outcome: 'YES' | 'NO', amount: string) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const formatLiquidity = (liquidity?: number): string => {
  const value = liquidity ?? 0;

  if (value >= 1000000) {
    const millions = value / 1000000;
    return `$${millions >= 10 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }

  if (value >= 1000) {
    const thousands = value / 1000;
    return `$${thousands.toFixed(0)}k`;
  }

  if (value <= 0) {
    return '$—';
  }

  return `$${value.toFixed(0)}`;
};

export const MarketCard = memo(function MarketCard({ market, onBet }: MarketCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>('YES');
  const [liveOdds, setLiveOdds] = useState(market.odds);
  const timeToResolve = useMemo(() => {
    if (!market.endDate) {
      return { label: 'TBD', tone: 'neutral' as const };
    }

    const marketClose = new Date(market.endDate);
    if (Number.isNaN(marketClose.getTime())) {
      return { label: 'TBD', tone: 'neutral' as const };
    }

    const diffMs = marketClose.getTime() - Date.now();

    if (diffMs <= 0) {
      return { label: 'Closed', tone: 'inactive' as const };
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays >= 1) {
      return { label: `${diffDays}d left`, tone: 'long' as const };
    }

    if (diffHours >= 1) {
      return { label: `${diffHours}h left`, tone: 'soon' as const };
    }

    return { label: `${Math.max(diffMinutes, 1)}m left`, tone: 'urgent' as const };
  }, [market.endDate]);
  
  const yesPercentage = Math.round(liveOdds.yes * 100);
  const noPercentage = Math.round(liveOdds.no * 100);

  // Live price updates via WebSocket
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    // Import WebSocket service dynamically to avoid SSR issues
    import('../lib/polymarketWebSocket').then(({ polymarketWS }) => {
      unsubscribe = polymarketWS.subscribe(market.id, (yesPrice, noPrice) => {
        setLiveOdds({
          yes: yesPrice,
          no: noPrice
        });
      });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [market.id]);

  const handleOutcomeClick = (outcome: 'YES' | 'NO') => {
    setSelectedOutcome(outcome);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="market-card">
        <div className="market-card-top">
          <div className="market-card-media">
            {market.imageUrl ? (
              <img src={market.imageUrl} alt={market.question} />
            ) : (
              <div className="market-card-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>

          <div className="market-card-content">
            <div className="market-card-tags" aria-label="Market tags">
              {market.sport && (
                <span className="market-card-tag">{market.sport}</span>
              )}
              <span className={`market-card-tag market-card-tag-${timeToResolve.tone}`}>
                {timeToResolve.label}
              </span>
            </div>
            <h3 className="market-card-title">{market.question}</h3>
            <div className="market-card-meta">
              <span className="market-card-meta-label">Liquidity</span>
              <span className="market-card-meta-value">{formatLiquidity(market.liquidity)}</span>
            </div>
          </div>
        </div>

        <div className="market-card-actions">
          <button
            onClick={() => handleOutcomeClick('YES')}
            className="market-outcome-button outcome-yes"
            type="button"
            aria-label={`Bet YES on ${market.question} at ${yesPercentage} cents`}
          >
            <span className="outcome-label">Yes</span>
            <span className="outcome-price">
              <AnimatedNumber
                value={yesPercentage}
                duration={400}
                decimals={0}
                suffix="¢"
              />
            </span>
          </button>

          <button
            onClick={() => handleOutcomeClick('NO')}
            className="market-outcome-button outcome-no"
            type="button"
            aria-label={`Bet NO on ${market.question} at ${noPercentage} cents`}
          >
            <span className="outcome-label">No</span>
            <span className="outcome-price">
              <AnimatedNumber
                value={noPercentage}
                duration={400}
                decimals={0}
                suffix="¢"
              />
            </span>
          </button>
        </div>
      </div>

      <BettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        market={market}
        selectedOutcome={selectedOutcome}
        onPlaceBet={onBet}
      />

      <style jsx>{`
        .market-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: slideUp 0.3s ease-out;
        }

        .market-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .market-card-top {
          display: flex;
          gap: 0.75rem;
        }

        .market-card-media {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          overflow: hidden;
          background: var(--card-bg-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .market-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .market-card-placeholder svg {
          width: 22px;
          height: 22px;
          opacity: 0.4;
        }

        .market-card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 0;
        }

        .market-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-size: 0.6875rem;
        }

        .market-card-tag {
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          background: var(--card-bg-subtle);
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .market-card-tag-long {
          background: rgba(74, 144, 226, 0.12);
          color: var(--primary);
        }

        .market-card-tag-neutral {
          background: var(--card-bg-subtle);
          color: var(--text-secondary);
        }

        .market-card-tag-soon {
          background: rgba(248, 180, 0, 0.12);
          color: var(--accent-gold);
        }

        .market-card-tag-urgent {
          background: rgba(231, 76, 60, 0.15);
          color: var(--danger);
        }

        .market-card-tag-inactive {
          background: rgba(138, 138, 138, 0.15);
          color: var(--text-muted);
        }

        .market-card-title {
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.35;
          color: var(--text-primary);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .market-card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .market-card-meta-value {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .market-card-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
        }

        .market-outcome-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          border-radius: 14px;
          padding: 0.85rem;
          border: none;
          color: #fff;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }

        .market-outcome-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.05) 1px,
            transparent 1px,
            transparent 2px
          );
          opacity: 0.3;
        }

        .market-outcome-button:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }

        .market-outcome-button:active {
          transform: translateY(0);
        }

        .market-outcome-button:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }

        .outcome-label {
          font-size: 0.6875rem;
          letter-spacing: 0.08em;
        }

        .outcome-price {
          font-size: 1.15rem;
          letter-spacing: -0.01em;
        }

        .outcome-yes {
          background: var(--yes-color);
          box-shadow: 0 10px 18px rgba(0, 184, 148, 0.25);
        }

        .outcome-no {
          background: var(--no-color);
          box-shadow: 0 10px 18px rgba(231, 76, 60, 0.25);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 768px) {
          .market-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </>
  );
});
