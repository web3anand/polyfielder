-- Supabase Database Schema for polyFielders
-- Run this in your Supabase SQL Editor

-- Markets table
CREATE TABLE IF NOT EXISTS markets (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  liquidity DECIMAL NOT NULL CHECK (liquidity > 10000),
  odds JSONB NOT NULL,
  sport TEXT NOT NULL,
  market_id TEXT, -- Polymarket market ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bets table
CREATE TABLE IF NOT EXISTS bets (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Wallet address
  market_id INT REFERENCES markets(id),
  amount DECIMAL NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('YES', 'NO')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'settled')),
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live events table for real-time scores
CREATE TABLE IF NOT EXISTS live_events (
  id SERIAL PRIMARY KEY,
  sport TEXT NOT NULL,
  score JSONB NOT NULL,
  status TEXT NOT NULL,
  external_id TEXT UNIQUE, -- ID from external API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (for wallet-based auth)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bets" ON bets
  FOR SELECT USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own bets" ON bets
  FOR INSERT WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Anyone can view markets" ON markets
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view live events" ON live_events
  FOR SELECT USING (true);

-- Enable Realtime for live_events
ALTER PUBLICATION supabase_realtime ADD TABLE live_events;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_markets_sport ON markets(sport);
CREATE INDEX IF NOT EXISTS idx_markets_liquidity ON markets(liquidity DESC);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_live_events_sport ON live_events(sport);
CREATE INDEX IF NOT EXISTS idx_live_events_external_id ON live_events(external_id);

