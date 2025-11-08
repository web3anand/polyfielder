'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { PositionCard } from '@/components/PositionCard';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface Position {
  id: string;
  marketTitle: string;
  side: 'yes' | 'no';
  shares: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
}

interface PortfolioData {
  positions: Position[];
  totals: {
    totalInvested: number;
    totalValue: number;
    totalPnL: number;
    pnlPercentage: string;
  };
}

export default function PortfolioPage() {
  const { isAuthenticated, isLoading: authLoading, userAddress, getAccessToken } = useAuth();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!isAuthenticated || !userAddress) {
        setPortfolioData(null);
        return;
      }

      setPortfolioLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          setPortfolioData(null);
          return;
        }

        const response = await fetch('/api/user/positions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Address': userAddress, // Send address in header since Privy tokens don't contain it
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPortfolioData({
              positions: data.positions || [],
              totals: data.totals || {
                totalInvested: 0,
                totalValue: 0,
                totalPnL: 0,
                pnlPercentage: '0.00',
              },
            });
          }
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setPortfolioData(null);
      } finally {
        setPortfolioLoading(false);
      }
    };

    fetchPortfolio();
  }, [isAuthenticated, userAddress, getAccessToken]);

  const positions = portfolioData?.positions || [];
  const totals = portfolioData?.totals || {
    totalInvested: 0,
    totalValue: 0,
    totalPnL: 0,
    pnlPercentage: '0.00',
  };

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full" style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}>
        <div className="pb-2">
          {/* Header */}
          <div className="px-4 mb-1.5">
            <h1 className="text-[var(--text-primary)] mb-0.5">Portfolio</h1>
            <p className="text-[var(--text-secondary)] text-xs">Track your positions</p>
          </div>

          {authLoading ? (
            <div className="px-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                <p className="text-[var(--text-muted)] text-sm">Loading...</p>
              </div>
            </div>
          ) : !isAuthenticated ? (
            <div className="px-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[var(--card-bg-subtle)] flex items-center justify-center border-2 border-dashed border-[var(--border-color)]">
                  <DollarSign className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h2 className="text-[var(--text-primary)] text-base font-bold mb-1">Connect Your Wallet</h2>
                <p className="text-[var(--text-secondary)] text-xs">
                  Please connect your wallet to view your portfolio
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Value Card */}
              <div className="px-4 mb-3">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 shadow-md pixel-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[var(--text-secondary)] text-xs uppercase tracking-wider font-bold">Total Value</span>
                    <div className="icon-badge rounded-full flex items-center justify-center" style={{ width: '36px', height: '36px' }}>
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="mb-1 text-[var(--text-primary)] text-2xl font-bold">
                    {portfolioLoading ? '...' : `$${totals.totalValue.toFixed(2)}`}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    {portfolioLoading ? (
                      <span className="text-[var(--text-muted)]">Loading...</span>
                    ) : totals.totalPnL >= 0 ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                        <span className="font-bold" style={{ color: 'var(--success)' }}>+${totals.totalPnL.toFixed(2)} ({totals.pnlPercentage}%)</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
                        <span className="font-bold" style={{ color: 'var(--danger)' }}>-${Math.abs(totals.totalPnL).toFixed(2)} ({totals.pnlPercentage}%)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="px-4 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="quick-stat-card rounded-2xl p-3 pixel-shadow text-white">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold opacity-90">Invested</div>
                    <div className="font-bold text-sm">{portfolioLoading ? '...' : `$${totals.totalInvested.toFixed(2)}`}</div>
                  </div>

                  <div className="quick-stat-card rounded-2xl p-3 pixel-shadow text-white" style={{ background: 'var(--color-secondary)' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold opacity-90">Positions</div>
                    <div className="font-bold text-sm">{portfolioLoading ? '...' : positions.length}</div>
                  </div>
                </div>
              </div>

              {/* Positions List */}
              <div className="px-4">
                <h2 className="text-[var(--text-primary)] mb-2 text-sm font-bold">Active Positions</h2>
                {portfolioLoading ? (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                    <p className="text-[var(--text-muted)] text-sm">Loading positions...</p>
                  </div>
                ) : positions.length === 0 ? (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 text-center">
                    <p className="text-[var(--text-secondary)] text-xs">No active positions</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {positions.map((position) => (
                      <PositionCard key={position.id} position={position} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
