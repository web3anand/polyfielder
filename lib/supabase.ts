import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co';

if (!isConfigured) {
  // Supabase credentials not configured
}

// Create Supabase client with realtime disabled if not properly configured
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    realtime: {
      // Disable realtime connections if Supabase is not configured
      // This prevents WebSocket connection errors in the console
      params: {
        eventsPerSecond: 0,
      },
    },
    global: {
      headers: {
        // Prevent auto-connect if not configured
        ...(isConfigured ? {} : { 'X-Client-Info': 'supabase-js/disabled' }),
      },
    },
  }
);

// Database schema types
export interface Market {
  id: number | string;
  question: string;
  liquidity: number;
  odds: {
    yes: number;
    no: number;
  };
  sport: string;
  market_id?: string; // Polymarket market ID
  imageUrl?: string; // Market image URL
  endDate?: string; // Market end date
  created_at?: string;
}

export interface Bet {
  id: number;
  user_id: string;
  market_id: number;
  amount: number;
  outcome: 'YES' | 'NO';
  status: 'pending' | 'confirmed' | 'settled';
  created_at?: string;
}

export interface LiveEvent {
  id: number;
  sport: string;
  score: {
    home: number;
    away: number;
    teams: {
      home: string;
      away: string;
    };
  };
  status: string;
  created_at?: string;
}

// Database operations
export const getMarkets = async (sport?: string): Promise<Market[]> => {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      return []; // Silently return empty - user hasn't configured Supabase yet
    }

    let query = supabase.from('markets').select('*').gt('liquidity', 10000);

    if (sport) {
      query = query.eq('sport', sport);
    }

    const { data, error } = await query.order('liquidity', { ascending: false });

    if (error) {
      // Silently handle table not found errors
      if (error.code === 'PGRST205' || error.message?.includes('not found')) {
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    // Suppress common configuration errors
    // console.error('Error fetching markets:', error);
    return [];
  }
};

export const saveBet = async (bet: Omit<Bet, 'id' | 'created_at'>): Promise<Bet | null> => {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
    }

    const { data, error } = await supabase
      .from('bets')
      .insert([bet])
      .select()
      .single();

    if (error) {
      // Handle table not found errors gracefully
      if (error.code === 'PGRST205' || error.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Silently handle errors
    return null;
  }
};

export const subscribeToLiveEvents = (
  sport: string,
  callback: (event: LiveEvent) => void
) => {
  // Don't attempt to subscribe if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
    // Return a no-op unsubscribe function
    return () => {};
  }

  const channel = supabase
    .channel(`sports-updates-${sport}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'live_events',
        filter: `sport=eq.${sport}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as LiveEvent);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

