'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArrowUp, ArrowDown, TrendingUp, Clock, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  type: 'trade' | 'deposit' | 'withdrawal';
  action?: 'Buy' | 'Sell';
  market?: string;
  outcome?: string;
  shares?: number;
  price?: number;
  total?: number;
  amount?: number;
  token?: string;
  timestamp: string;
  status: string;
  transaction_hash?: string;
}

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading, userAddress, getAccessToken } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'trades' | 'deposits' | 'withdrawals'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isAuthenticated || !userAddress) {
        setTransactions([]);
        return;
      }

      setTransactionsLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          setTransactions([]);
          return;
        }

        const response = await fetch(`/api/user/transactions?type=${filterType}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Address': userAddress, // Send address in header since Privy tokens don't contain it
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTransactions(data.transactions || []);
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [isAuthenticated, userAddress, filterType, getAccessToken]);

  const filteredTransactions = transactions;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full" style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}>
        <div className="pb-2">
          {/* Header */}
          <div className="px-4 mb-1.5">
            <h1 className="text-[var(--text-primary)] mb-0.5">History</h1>
            <p className="text-[var(--text-secondary)] text-xs">Transaction history</p>
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
                  <Clock className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h2 className="text-[var(--text-primary)] text-base font-bold mb-1">Connect Your Wallet</h2>
                <p className="text-[var(--text-secondary)] text-xs">
                  Please connect your wallet to view your transaction history
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Filter Tabs */}
              <div className="px-4 mb-3">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm pixel-shadow">
                  <div className="flex gap-2 p-2 overflow-x-auto scrollbar-hide">
                    {['all', 'trades', 'deposits', 'withdrawals'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFilterType(filter as any)}
                        className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                          filterType === filter
                            ? 'text-white pixel-shadow'
                            : 'bg-[var(--card-bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)]'
                        }`}
                        style={filterType === filter ? { background: 'var(--primary)' } : {}}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="px-4">
                {transactionsLoading ? (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                    <p className="text-[var(--text-muted)] text-sm">Loading transactions...</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--card-bg-subtle)] flex items-center justify-center">
                      <Filter className="w-7 h-7 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-[var(--text-primary)] text-sm font-bold mb-1">No Transactions</h3>
                    <p className="text-[var(--text-secondary)] text-xs">
                      Your transaction history will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-3 shadow-sm pixel-shadow"
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Icon */}
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border"
                            style={{
                              background: tx.type === 'trade' 
                                ? (tx as any).action === 'Buy' 
                                  ? 'var(--yes-light)'
                                  : 'var(--no-light)'
                                : tx.type === 'deposit'
                                ? 'var(--primary-light)'
                                : 'var(--warning)',
                              borderColor: tx.type === 'trade'
                                ? (tx as any).action === 'Buy'
                                  ? 'var(--yes-color)'
                                  : 'var(--no-color)'
                                : tx.type === 'deposit'
                                ? 'var(--primary)'
                                : 'var(--warning)'
                            }}
                          >
                            {tx.type === 'trade' && ((tx as any).action === 'Buy' ? (
                              <ArrowUp className="w-4 h-4" style={{ color: 'var(--yes-color)' }} />
                            ) : (
                              <ArrowDown className="w-4 h-4" style={{ color: 'var(--no-color)' }} />
                            ))}
                            {tx.type === 'deposit' && (
                              <TrendingUp className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                            )}
                            {tx.type === 'withdrawal' && (
                              <ArrowDown className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {tx.type === 'trade' ? (
                              <>
                                <div className="flex items-center gap-2 mb-1">
                                  <span 
                                    className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border"
                                    style={{
                                      background: (tx as any).action === 'Buy' ? 'var(--yes-light)' : 'var(--no-light)',
                                      color: (tx as any).action === 'Buy' ? 'var(--yes-color)' : 'var(--no-color)',
                                      borderColor: (tx as any).action === 'Buy' ? 'var(--yes-color)' : 'var(--no-color)'
                                    }}
                                  >
                                    {(tx as any).action}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--card-bg-subtle)] text-[var(--text-secondary)] font-medium">
                                    {(tx as any).outcome}
                                  </span>
                                </div>
                                <h3 className="text-[var(--text-primary)] text-sm font-bold mb-0.5 leading-tight">
                                  {(tx as any).market}
                                </h3>
                                <p className="text-[10px] text-[var(--text-muted)] mb-1.5">
                                  {(tx as any).shares} shares @ ${(tx as any).price.toFixed(2)}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="mb-1">
                                  <span 
                                    className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border"
                                    style={{
                                      background: tx.type === 'deposit' ? 'var(--primary-light)' : 'rgba(243, 156, 18, 0.1)',
                                      color: tx.type === 'deposit' ? 'var(--primary)' : 'var(--warning)',
                                      borderColor: tx.type === 'deposit' ? 'var(--primary)' : 'var(--warning)'
                                    }}
                                  >
                                    {tx.type}
                                  </span>
                                </div>
                                <h3 className="text-[var(--text-primary)] text-sm font-bold mb-0.5">
                                  {(tx as any).amount} {(tx as any).token}
                                </h3>
                                {(tx as any).txHash && (
                                  <p className="text-[10px] text-[var(--text-muted)] font-mono mb-1.5">
                                    {(tx as any).txHash}
                                  </p>
                                )}
                              </>
                            )}
                            <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(tx.timestamp)}</span>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right flex-shrink-0">
                            {tx.type === 'trade' ? (
                              <p 
                                className="text-sm font-bold mb-0.5"
                                style={{ color: (tx as any).action === 'Buy' ? 'var(--no-color)' : 'var(--yes-color)' }}
                              >
                                {(tx as any).action === 'Buy' ? '-' : '+'}${(tx as any).total.toFixed(2)}
                              </p>
                            ) : (
                              <p 
                                className="text-sm font-bold mb-0.5"
                                style={{ color: tx.type === 'deposit' ? 'var(--yes-color)' : 'var(--no-color)' }}
                              >
                                {tx.type === 'deposit' ? '+' : '-'}${(tx as any).amount}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
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
