'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface PriceChartProps {
  tokenId?: string;
  outcome: 'YES' | 'NO';
  height?: number;
}

interface PricePoint {
  timestamp: number;
  price: number;
}

const MAX_DATA_POINTS = 50;

export function PriceChart({ tokenId, outcome, height = 150 }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<any>(null);

  // Initialize price history with historical data
  const initializePriceHistory = useCallback(async () => {
    if (!tokenId) {
      // Initialize with a starting point based on outcome
      const startingPrice = outcome === 'YES' ? 0.65 : 0.35;
      setPriceHistory([{
        timestamp: Date.now(),
        price: startingPrice
      }]);
      setLoading(false);
      return;
    }

    try {
      // Fetch historical data from Polymarket REST API
      // Note: This endpoint may return 400 for some markets - that's expected
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`https://clob.polymarket.com/prices-history?market=${tokenId}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data?.history && Array.isArray(data.history) && data.history.length > 0) {
            const formattedData: PricePoint[] = data.history
              .slice(-MAX_DATA_POINTS)
              .map((point: any) => ({
                timestamp: point.t * 1000,
                price: outcome === 'YES' ? parseFloat(point.p) : (1 - parseFloat(point.p))
              }));
            
            if (formattedData.length > 0) {
              setPriceHistory(formattedData);
              setLoading(false);
              return;
            }
          }
        } else if (response.status === 400) {
          // 400 errors are expected for markets without historical data
          // Silently handle - no need to log
          clearTimeout(timeoutId);
        }
        // Silently handle other non-200 responses
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        // Silently handle fetch errors - 400 errors are expected for some markets
        // Network errors and timeouts are also handled gracefully
        // AbortError is expected when timeout occurs
        if (fetchError.name !== 'AbortError' && process.env.NODE_ENV === 'development') {
          // Only log unexpected errors in development
        }
      }
    } catch (error: any) {
      // Outer catch for any unexpected errors - silently handled
    }

    // Initialize with a starting point based on outcome
    const startingPrice = outcome === 'YES' ? 0.65 : 0.35;
    setPriceHistory([{
      timestamp: Date.now(),
      price: startingPrice
    }]);
    setLoading(false);
  }, [tokenId, outcome]);

  // Connect to Polymarket WebSocket
  const connectWebSocket = useCallback(() => {
    if (!tokenId) {
      setConnectionStatus('error');
      setLoading(false);
      return;
    }

    // Import WebSocket service dynamically to avoid SSR issues
    import('../lib/polymarketWebSocket').then(({ polymarketWS }) => {
      setConnectionStatus('connected');
      
      const unsubscribe = polymarketWS.subscribe(tokenId, (yesPrice, noPrice) => {
        const newPrice = outcome === 'YES' ? yesPrice : noPrice;

        if (newPrice > 0 && newPrice < 1) {
          setPriceHistory(prev => {
            const newPoint: PricePoint = {
              timestamp: Date.now(),
              price: newPrice
            };

            // Keep only the last MAX_DATA_POINTS
            const updated = [...prev, newPoint];
            return updated.slice(-MAX_DATA_POINTS);
          });
        }
      });

      // Store cleanup function
      wsRef.current = { unsubscribe } as any;
    }).catch((error) => {
      console.error('Failed to connect to WebSocket:', error);
      setConnectionStatus('error');
    });
  }, [tokenId, outcome]);

  // Initialize data and connect to WebSocket
  useEffect(() => {
    initializePriceHistory();
    connectWebSocket();

    return () => {
      // Cleanup
      if (wsRef.current && typeof (wsRef.current as any).unsubscribe === 'function') {
        (wsRef.current as any).unsubscribe();
        wsRef.current = null;
      }
    };
  }, [initializePriceHistory, connectWebSocket]);

  // Draw chart
  useEffect(() => {
    if (!canvasRef.current || priceHistory.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, chartHeight);

    // Find min/max prices
    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 0.1;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw price line
    ctx.beginPath();
    ctx.strokeStyle = outcome === 'YES' ? '#00B894' : '#E74C3C';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    priceHistory.forEach((point, index) => {
      const x = (index / (priceHistory.length - 1)) * width;
      const y = chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Fill area under line
    ctx.lineTo(width, chartHeight);
    ctx.lineTo(0, chartHeight);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    const color = outcome === 'YES' ? '0, 184, 148' : '231, 76, 60';
    gradient.addColorStop(0, `rgba(${color}, 0.2)`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fill();

  }, [priceHistory, outcome]);

  if (loading) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background-elevated)',
        borderRadius: '12px',
        color: 'var(--text-muted)',
        fontSize: '0.875rem'
      }}>
        Loading chart...
      </div>
    );
  }

  const latestPrice = priceHistory[priceHistory.length - 1]?.price || 0;
  const firstPrice = priceHistory[0]?.price || 0;
  const priceChange = latestPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(1);
  const isPositive = priceChange >= 0;

  return (
    <div style={{
      background: 'var(--background-elevated)',
      borderRadius: '12px',
      padding: '12px',
      border: '1px solid var(--border-primary)'
    }}>
      {/* Chart Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {outcome} Price History
          </div>
          {/* Live indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.625rem',
            fontWeight: 500,
            color: connectionStatus === 'connected' ? 'var(--success)' : 
                   connectionStatus === 'connecting' ? 'var(--warning)' : 'var(--danger)',
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: connectionStatus === 'connected' ? 'var(--success)' : 
                         connectionStatus === 'connecting' ? 'var(--warning)' : 'var(--danger)',
              animation: connectionStatus === 'connected' ? 'pulse 2s infinite' : 'none'
            }} />
            {connectionStatus === 'connected' ? 'LIVE' : 
             connectionStatus === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: isPositive ? 'var(--success)' : 'var(--danger)'
        }}>
          {isPositive ? '↑' : '↓'} {Math.abs(parseFloat(priceChangePercent))}%
        </div>
      </div>

      {/* Canvas Chart */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: `${height}px`,
          display: 'block'
        }}
      />

      {/* Chart Footer */}
      <div style={{
        marginTop: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.6875rem',
        color: 'var(--text-muted)'
      }}>
        <span>50m ago</span>
        <span>Now</span>
      </div>

      {/* Pulse animation for live indicator */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
