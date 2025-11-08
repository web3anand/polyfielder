'use client';

import { useState, useEffect } from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { PriceChart } from './PriceChart';

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: string;
    question: string;
    odds: { yes: number; no: number };
    liquidity?: number;
  };
  selectedOutcome: 'YES' | 'NO';
  onPlaceBet: (marketId: string, outcome: 'YES' | 'NO', amount: string) => void;
}

export function BettingModal({ isOpen, onClose, market, selectedOutcome: initialOutcome, onPlaceBet }: BettingModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>(initialOutcome);
  const [liveOdds, setLiveOdds] = useState(market.odds);
  
  const selectedOdds = selectedOutcome === 'YES' ? liveOdds.yes : liveOdds.no;
  const yesPercentage = Math.round(liveOdds.yes * 100);
  const noPercentage = Math.round(liveOdds.no * 100);

  // Update selectedOutcome when initialOutcome changes (when modal opens with different selection)
  useEffect(() => {
    if (isOpen) {
      setSelectedOutcome(initialOutcome);
      setLiveOdds(market.odds); // Reset to market odds when opening
    }
  }, [isOpen, initialOutcome, market.odds]);

  // Live price updates via WebSocket while modal is open
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, market.id]);

  useEffect(() => {
    if (isOpen) {
      // Do nothing - allow body to scroll naturally
      // The modal backdrop will handle preventing interaction
    }
    return () => {
      // Cleanup - do nothing
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickAmount = (value: string) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setAmount(value);
  };

  const shares = amount ? Math.floor(parseFloat(amount) / selectedOdds) : 0;
  const potentialReturn = amount ? (shares * (selectedOutcome === 'YES' ? 1 : 1)) : 0;

  const handlePlaceBet = () => {
    if (amount && parseFloat(amount) > 0) {
      onPlaceBet(market.id, selectedOutcome, amount);
      onClose();
      setAmount('');
      setCustomAmount('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out',
          touchAction: 'none',
        }}
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--background-primary)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          zIndex: 9999,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideUpSmooth 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle Bar */}
        <div
          style={{
            width: '40px',
            height: '4px',
            background: 'var(--text-muted)',
            borderRadius: '2px',
            margin: '12px auto 0',
            opacity: 0.3,
          }}
        />

        {/* Modal Content */}
        <div style={{ 
          padding: '20px 20px 32px', 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
        }}>
          {/* Header with YES/NO Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ flex: 1, paddingRight: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.2 }}>
                {tradeMode === 'BUY' ? 'Buy Shares' : 'Sell Shares'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                {market.question}
              </p>
            </div>
            
            {/* YES/NO Toggle Switch - Top Right Corner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div
                style={{
                  display: 'inline-flex',
                  background: 'var(--background-elevated)',
                  borderRadius: '8px',
                  padding: '3px',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <button
                  onClick={() => setSelectedOutcome('YES')}
                  style={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: selectedOutcome === 'YES' ? 'var(--yes-color)' : 'transparent',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: selectedOutcome === 'YES' ? '#fff' : 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}
                >
                  YES
                </button>
                <button
                  onClick={() => setSelectedOutcome('NO')}
                  style={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: selectedOutcome === 'NO' ? 'var(--no-color)' : 'transparent',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: selectedOutcome === 'NO' ? '#fff' : 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}
                >
                  NO
                </button>
              </div>
              
              <button
                onClick={onClose}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'var(--background-elevated)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Price Display */}
          <div style={{ 
            marginBottom: '20px',
            padding: '16px',
            background: 'var(--background-elevated)',
            borderRadius: '12px',
            border: `2px solid ${selectedOutcome === 'YES' ? 'var(--yes-color)' : 'var(--no-color)'}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {selectedOutcome} Share Price
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: selectedOutcome === 'YES' ? 'var(--yes-color)' : 'var(--no-color)' }}>
              <AnimatedNumber 
                value={selectedOutcome === 'YES' ? yesPercentage : noPercentage}
                duration={400}
                decimals={0}
                suffix="¢"
              />
            </div>
          </div>

          {/* Price Chart */}
          <div style={{ marginBottom: '20px' }}>
            <PriceChart 
              tokenId={market.id}
              outcome={selectedOutcome}
              height={120}
            />
          </div>

          {/* Buy/Sell Action Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Select Action
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* BUY Button */}
              <button
                onClick={() => setTradeMode('BUY')}
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  padding: '14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: tradeMode === 'BUY' ? 'var(--success)' : 'var(--background-elevated)',
                  border: tradeMode === 'BUY' ? '2px solid var(--success)' : '2px solid var(--success)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: tradeMode === 'BUY' ? '#fff' : 'var(--success)', marginBottom: '4px' }}>
                  Buy
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: tradeMode === 'BUY' ? '#fff' : 'var(--success)' }}>
                  <AnimatedNumber 
                    value={selectedOutcome === 'YES' ? yesPercentage : noPercentage}
                    duration={400}
                    decimals={0}
                    suffix="¢"
                  />
                </div>
              </button>

              {/* SELL Button */}
              <button
                onClick={() => setTradeMode('SELL')}
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  padding: '14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: tradeMode === 'SELL' ? 'var(--danger)' : 'var(--background-elevated)',
                  border: tradeMode === 'SELL' ? '2px solid var(--danger)' : '2px solid var(--danger)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: tradeMode === 'SELL' ? '#fff' : 'var(--danger)', marginBottom: '4px' }}>
                  Sell
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: tradeMode === 'SELL' ? '#fff' : 'var(--danger)' }}>
                  <AnimatedNumber 
                    value={selectedOutcome === 'YES' ? yesPercentage : noPercentage}
                    duration={400}
                    decimals={0}
                    suffix="¢"
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Amount
            </label>
            
            {/* Custom Amount Input */}
            <div
              style={{
                position: 'relative',
                marginBottom: '12px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  pointerEvents: 'none',
                }}
              >
                $
              </span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="0"
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  width: '100%',
                  padding: '16px 16px 16px 32px',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'var(--background-elevated)',
                  borderRadius: '12px',
                  border: '2px solid var(--border-primary)',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid var(--accent-primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '2px solid var(--border-primary)';
                }}
              />
            </div>

            {/* Quick Amount Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {['10', '25', '50', '100'].map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickAmount(value)}
                  style={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    padding: '12px 8px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: amount === value ? 'var(--accent-primary)' : 'var(--background-elevated)',
                    border: amount === value ? '2px solid var(--accent-primary)' : '2px solid var(--border-primary)',
                    textAlign: 'center',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: amount === value ? '#fff' : 'var(--text-primary)',
                  }}
                >
                  ${value}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div
            style={{
              background: 'var(--background-elevated)',
              border: '2px solid var(--border-primary)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--primary)' }}>
                {tradeMode === 'BUY' 
                  ? `You'll receive ${shares} ${selectedOutcome} shares at ${Math.round(selectedOdds * 100)}¢ each`
                  : `You'll sell ${shares} ${selectedOutcome} shares at ${Math.round(selectedOdds * 100)}¢ each`
                }
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {tradeMode === 'BUY' ? 'Investment' : 'Sale Value'}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                ${amount || '0.00'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Shares</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {shares} {selectedOutcome}
              </span>
            </div>
            
            <div style={{ height: '1px', background: 'var(--border-primary)', margin: '12px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {tradeMode === 'BUY' ? 'Potential Return' : 'You\'ll Receive'}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: tradeMode === 'BUY' ? 'var(--success)' : 'var(--info)' }}>
                {tradeMode === 'BUY' ? '+' : ''}${potentialReturn > 0 ? potentialReturn.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handlePlaceBet}
            disabled={!amount || parseFloat(amount) <= 0}
            style={{
              all: 'unset',
              boxSizing: 'border-box',
              width: '100%',
              padding: '20px',
              borderRadius: '16px',
              cursor: amount && parseFloat(amount) > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              background: amount && parseFloat(amount) > 0 
                ? (tradeMode === 'BUY' ? 'var(--success)' : 'var(--danger)')
                : 'var(--primary-light)',
              textAlign: 'center',
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: amount && parseFloat(amount) > 0 ? 1 : 0.5,
            }}
          >
            {tradeMode === 'BUY' ? `Buy ${selectedOutcome} Shares` : `Sell ${selectedOutcome} Shares`}
          </button>
        </div>
      </div>

      <style jsx>{`
        /* Hide scrollbar while keeping scroll functionality */
        div::-webkit-scrollbar {
          display: none;
        }
        
        div {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUpSmooth {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

