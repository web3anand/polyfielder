'use client';

import { memo, useState, useEffect } from 'react';
import { BettingModal } from './BettingModal';
import { AnimatedNumber } from './AnimatedNumber';

interface MarketCardProps {
  market: {
    id: string;
    question: string;
    liquidity: number;
    odds: { yes: number; no: number };
    sport?: string;
    endDate?: string;
    imageUrl?: string;
  };
  onBet: (marketId: string, outcome: 'YES' | 'NO', amount: string) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const formatLiquidity = (liquidity: number): string => {
  if (liquidity >= 1000000) {
    const millions = liquidity / 1000000;
    return `$${millions >= 10 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  } else if (liquidity >= 1000) {
    const thousands = liquidity / 1000;
    return `$${thousands.toFixed(0)}k`;
  } else {
    return `$${liquidity.toFixed(0)}`;
  }
};

export const MarketCard = memo(function MarketCard({ market, onBet }: MarketCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>('YES');
  const [liveOdds, setLiveOdds] = useState(market.odds);
  
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
      <div className="polymarket-card-new">
        <div className="polymarket-card-inner">
          {/* Top Row: Image + Title + Volume */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
            {/* Market Image */}
            <div
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'var(--card-bg-subtle)',
                flexShrink: 0,
              }}
            >
              {market.imageUrl ? (
                <img
                  src={market.imageUrl}
                  alt={market.question}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <svg style={{ width: '20px', height: '20px', opacity: 0.3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title + Volume Container */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Question Title */}
              <h3 
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  lineHeight: 1.35,
                  color: 'var(--text-primary)',
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {market.question}
              </h3>

              {/* Volume */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                <span style={{ fontWeight: 500 }}>{formatLiquidity(market.liquidity)}</span>
              </div>
            </div>
          </div>

          {/* YES/NO Buttons - Solid Pixel Style */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* YES Button */}
            <button
              onClick={() => handleOutcomeClick('YES')}
              className="polymarket-yes-btn-solid"
              style={{
                all: 'unset',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 8px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 1px,
                    rgba(255, 255, 255, 0.08) 1px,
                    rgba(255, 255, 255, 0.08) 2px
                  )
                `,
                backgroundColor: 'var(--yes-color)',
                boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.4), 4px 4px 0px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                border: 'none',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', position: 'relative', zIndex: 10 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', marginBottom: '2px' }}>
                  Yes
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  <AnimatedNumber 
                    value={yesPercentage} 
                    duration={400}
                    decimals={0}
                    suffix="¢"
                  />
                </div>
              </div>
            </button>

            {/* NO Button */}
            <button
              onClick={() => handleOutcomeClick('NO')}
              className="polymarket-no-btn-solid"
              style={{
                all: 'unset',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 8px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 1px,
                    rgba(255, 255, 255, 0.08) 1px,
                    rgba(255, 255, 255, 0.08) 2px
                  )
                `,
                backgroundColor: 'var(--no-color)',
                boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.4), 4px 4px 0px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                border: 'none',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', position: 'relative', zIndex: 10 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', marginBottom: '2px' }}>
                  No
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  <AnimatedNumber 
                    value={noPercentage} 
                    duration={400}
                    decimals={0}
                    suffix="¢"
                  />
                </div>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Betting Modal */}
      <BettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        market={market}
        selectedOutcome={selectedOutcome}
        onPlaceBet={onBet}
      />

      <style jsx>{`
        .polymarket-card-new {
          width: 100%;
          animation: slideUp 0.3s ease-out;
        }
        
        .polymarket-card-inner {
          background: var(--bg-card);
          border-radius: 14px;
          padding: 12px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }
        
        .polymarket-card-inner:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          transform: translateY(-1px);
        }
        
        /* YES Button Solid Hover */
        .polymarket-yes-btn-solid:hover {
          background-color: var(--yes-hover) !important;
        }
        
        .polymarket-yes-btn-solid:active {
          transform: scale(0.95);
        }
        
        .polymarket-yes-btn-solid:focus {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        
        /* NO Button Solid Hover */
        .polymarket-no-btn-solid:hover {
          background-color: var(--no-hover) !important;
        }
        
        .polymarket-no-btn-solid:active {
          transform: scale(0.95);
        }
        
        .polymarket-no-btn-solid:focus {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        
        /* Pixel Border Effect */
        .polymarket-yes-btn-solid::before,
        .polymarket-no-btn-solid::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
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
        
        @media (min-width: 640px) {
          .polymarket-yes-btn-solid,
          .polymarket-no-btn-solid {
            padding: 0.75rem;
          }
        }
      `}</style>
    </>
  );
});
