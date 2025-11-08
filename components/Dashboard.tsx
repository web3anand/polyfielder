'use client';

import { useState, useEffect, startTransition, useCallback, useRef, useMemo } from 'react';
import { MarketCard } from './MarketCard';
import { LiveScores } from './LiveScores';
import { useAccount } from 'wagmi';
import { initPM, initPMWithBuilder, getActiveMarkets, placeBet, placeBetWithBuilder } from '@/lib/pm';
import { getMarkets, saveBet } from '@/lib/supabase';
import { ethers } from 'ethers';
import type { Market } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { SkeletonLoader } from './SkeletonLoader';
import { SearchBar } from './SearchBar';
import {
  AllIcon,
  NbaIcon,
  NflIcon,
  SoccerIcon,
  TennisIcon,
  CricketIcon,
} from './SportIcons';

const SPORTS = [
  { id: 'All', label: 'All', icon: <AllIcon /> },
  { id: 'Basketball', label: 'Basketball', icon: <NbaIcon /> },
  { id: 'Football', label: 'American Football', icon: <NflIcon /> },
  { id: 'Baseball', label: 'Baseball', icon: <NbaIcon /> },
  { id: 'Hockey', label: 'Hockey', icon: <NbaIcon /> },
  { id: 'Soccer', label: 'Soccer', icon: <SoccerIcon /> },
  { id: 'Cricket', label: 'Cricket', icon: <CricketIcon /> },
  { id: 'Tennis', label: 'Tennis', icon: <TennisIcon /> },
];

function DashboardContent() {
  const [selectedSport, setSelectedSport] = useState('All');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
      const [hasMore, setHasMore] = useState(false);
      const [nextOffset, setNextOffset] = useState(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [polymarket, setPolymarket] = useState<any>(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [relayerClient, setRelayerClient] = useState<any>(null); // BuilderRelayerClient type
      const [useBuilder] = useState(true);
      const { address, isConnected } = useAccount();
      const { showToast, ToastContainer } = useToast();
      const [apiError, setApiError] = useState<string | null>(null);
  
  // Live markets disabled
  const liveMarkets: any[] = [];
  const wsConnected = false;
  
  // Ref to prevent multiple simultaneous API calls
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filter markets by search query
  const filteredMarkets = useMemo(() => {
    if (!searchQuery.trim()) return markets;
    const query = searchQuery.toLowerCase();
    return markets.filter((market) =>
      market.question.toLowerCase().includes(query) ||
      market.sport?.toLowerCase().includes(query)
    );
  }, [markets, searchQuery]);

  const loadMarkets = useCallback(async (append = false, offset = 0) => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return;
    }
    
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    isLoadingRef.current = true;
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setMarkets([]); // Clear markets when changing sport
      setNextOffset(0);
      setHasMore(false);
    }
    
    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
        try {
          const sportFilter = selectedSport === 'All' ? 'all' : selectedSport.toLowerCase();
          
          // Fetch real markets from Polymarket Gamma API with pagination
          const response = await fetch(
            `/api/markets?sport=${sportFilter}&limit=100&offset=${offset}`,
            { signal: abortController.signal }
          );
          
          if (response.ok) {
            const data = await response.json();
            
            // Check if API call was successful
            if (data.success === false) {
              // API returned an error
              setApiError(data.error || 'Failed to fetch markets');
              if (!append) {
                setMarkets([]);
                setLoading(false);
                isLoadingRef.current = false;
                abortControllerRef.current = null;
              }
              // Try fallback sources
            } else if (data.markets && Array.isArray(data.markets)) {
              // Clear any previous errors
              setApiError(null);
              
              // Successfully got markets (even if empty array)
              if (data.markets.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const transformedMarkets = data.markets.map((m: any) => ({
                  ...m,
                  id: m.id || m.market_id,
                }));
                
                if (append) {
                  // Append to existing markets, avoiding duplicates
                  setMarkets((prev) => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const newMarkets = transformedMarkets.filter((m: Market) => !existingIds.has(m.id));
                    return [...prev, ...newMarkets];
                  });
                } else {
                  setMarkets(transformedMarkets);
                }
            
            setHasMore(data.hasMore || false);
            setNextOffset(data.nextOffset || offset);
            setLoading(false);
            setLoadingMore(false);
            isLoadingRef.current = false;
            abortControllerRef.current = null;
            return;
          } else if (!append) {
            // Empty markets array - try fallback
            setMarkets([]);
          }
        }
      }

      // Fallback: Try Supabase (only for initial load, not pagination)
      if (!append) {
        const supabaseMarkets = await getMarkets(
          selectedSport === 'All' ? undefined : selectedSport.toLowerCase()
        );
        if (supabaseMarkets.length > 0) {
          setMarkets(supabaseMarkets);
          setHasMore(false);
          setLoading(false);
          isLoadingRef.current = false;
          abortControllerRef.current = null;
          return;
        }

        // Last resort: Try Polymarket SDK if wallet is connected
        if (polymarket) {
            const pmMarkets = await getActiveMarkets(polymarket, {
              sport: selectedSport === 'All' ? undefined : selectedSport.toLowerCase(),
            });
          if (pmMarkets.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const transformed = pmMarkets.map((m: any) => {
              const marketId = m.id || m.market_id;
              const liveMarket = liveMarkets.find((lm) => lm.id === marketId);
              return {
                id: marketId,
                question: liveMarket?.question || m.question,
                liquidity: liveMarket?.liquidity || parseFloat(m.liquidity || '0'),
                odds: liveMarket?.odds || {
                  yes: parseFloat(m.outcomes?.yes?.price || '0.5'),
                  no: parseFloat(m.outcomes?.no?.price || '0.5'),
                },
                sport: selectedSport === 'All' ? 'general' : selectedSport.toLowerCase(),
                market_id: marketId,
              };
            });
            setMarkets(transformed);
            setHasMore(false);
            setLoading(false);
            isLoadingRef.current = false;
            abortControllerRef.current = null;
            return;
          }
        }
      }

      // No markets found
      if (!append) {
        setMarkets([]);
      }
      setHasMore(false);
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
      abortControllerRef.current = null;
        } catch (error) {
          // Ignore abort errors
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setApiError(`Failed to load markets: ${errorMessage}`);
          
          if (!append) {
            setMarkets([]);
          }
          setHasMore(false);
          setLoading(false);
          setLoadingMore(false);
          isLoadingRef.current = false;
          abortControllerRef.current = null;
        }
      }, [selectedSport, polymarket, liveMarkets]);
  
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadMarkets(true, nextOffset);
    }
  }, [hasMore, loadingMore, nextOffset, loadMarkets]);

  // Only load markets when selectedSport changes (initial load)
  useEffect(() => {
    loadMarkets(false, 0);
    
    // Auto-refresh markets every 30 seconds for live data
    const refreshInterval = setInterval(() => {
      if (!loading && !loadingMore) {
        loadMarkets(false, 0);
      }
    }, 30000); // 30 seconds
    
    // Cleanup: abort request on unmount or when selectedSport changes
    return () => {
      clearInterval(refreshInterval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSport]);

  // Live updates disabled

  useEffect(() => {
    if (isConnected && address) {
      initializePolymarket();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  const initializePolymarket = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner().catch(() => null);
        
        if (!signer) {
          return;
        }
        
        if (useBuilder) {
          // Use Builder Program for gasless transactions
          // Note: Builder keys are server-side only (not NEXT_PUBLIC_)
          try {
            const { polymarket, relayerClient } = await initPMWithBuilder(signer);
            setPolymarket(polymarket);
            setRelayerClient(relayerClient);
          } catch (builderError) {
            // Fallback to standard initialization if builder fails
            const pm = await initPM(signer);
            setPolymarket(pm);
          }
        } else {
          // Standard initialization
          const pm = await initPM(signer);
          setPolymarket(pm);
        }
      }
    } catch (error) {
      // Silently fail - markets will still load from API
      // Wallet connection is optional for viewing markets
    }
  };

  const handleBet = async (marketId: string, outcome: 'YES' | 'NO', amount: string) => {
    if (!polymarket || !address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      let order;
      
      // Use Builder Relayer for gasless transactions if available
      if (relayerClient && useBuilder) {
        order = await placeBetWithBuilder(relayerClient, marketId, outcome, amount);
        alert(`✅ Bet placed successfully via Builder Relayer (GASLESS)! ${outcome} $${amount}\nOrder ID: ${order.orderId}`);
      } else {
        // Fallback to standard bet placement
        order = await placeBet(polymarket, marketId, outcome, amount);
        alert(`Bet placed successfully! ${outcome} $${amount}`);
      }

      // Save to Supabase
      if (order) {
        await saveBet({
          user_id: address,
          market_id: parseInt(marketId),
          amount: parseFloat(amount),
          outcome,
          status: 'pending',
        });

        loadMarkets(false, 0); // Refresh markets
      }
    } catch (error) {
      showToast('Failed to place bet. Please try again.', 'error');
    }
  };

  return (
    <main className="min-h-screen dashboard-main" style={{ background: 'var(--background)' }}>
      <ToastContainer />
      
      {/* Sport Filter Bar - Scrolls normally */}
      <div className="sport-filter-container">
        <div className="sport-filter-wrapper">
          {SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id)}
              className={`sport-pill ${
                selectedSport === sport.id
                  ? 'sport-pill-selected'
                  : 'sport-pill-unselected'
              }`}
            >
              <span className="sport-icon">{sport.icon}</span>
              <span className="sport-label">{sport.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar - Sticky with header */}
      <div className="search-bar-wrapper-sticky">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Markets List */}
      {loading ? (
        <SkeletonLoader count={5} />
      ) : apiError ? (
        <div className="empty-state" style={{ margin: '0 clamp(1rem, 4vw, 1.5rem)' }}>
          <div className="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="empty-state-title">Error Loading Markets</p>
          <p className="empty-state-subtitle">{apiError}</p>
          <button 
            onClick={() => {
              setApiError(null);
              loadMarkets(false, 0);
            }}
            className="retry-button"
            style={{ marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      ) : filteredMarkets.length === 0 ? (
        <div className="empty-state" style={{ margin: '0 clamp(1rem, 4vw, 1.5rem)' }}>
          <div className="empty-state-icon">
            {searchQuery ? (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            ) : (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            )}
          </div>
          <p className="empty-state-title">
            {searchQuery ? 'No markets found' : `No ${selectedSport === 'All' ? '' : selectedSport + ' '}markets available`}
          </p>
          <p className="empty-state-subtitle">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : selectedSport === 'Cricket' 
                ? 'Cricket markets may not be active right now. There are no major cricket events currently. Try "All" to see other available markets.'
                : 'Try selecting a different sport or check back later'}
          </p>
        </div>
      ) : (
        <div className="market-list-container">
          {filteredMarkets.map((market: Market) => (
            <MarketCard
              key={String(market.id)}
              market={{
                id: String(market.id),
                question: market.question,
                liquidity: market.liquidity,
                odds: market.odds,
                sport: market.sport,
                endDate: market.endDate,
                imageUrl: market.imageUrl,
              }}
              onBet={handleBet}
              showToast={showToast}
            />
          ))}
        </div>
      )}

      {!loading && markets.length > 0 && hasMore && (
        <div className="load-more-wrapper">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="load-more-button"
          >
            {loadingMore ? 'Loading...' : 'Load More Markets'}
          </button>
        </div>
      )}
      
      {!loading && !hasMore && markets.length > 0 && (
        <div className="load-more-wrapper">
          <p style={{ 
            textAlign: 'center', 
            color: 'var(--text-secondary)', 
            fontSize: '0.875rem',
            padding: '1rem'
          }}>
            {markets.length} markets loaded
          </p>
        </div>
      )}
    </main>
  );
}

function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="h-screen w-full animate-pulse rounded-2xl bg-gray-200"></div>
      </main>
    );
  }

  return <DashboardContent />;
}

export default Dashboard;

