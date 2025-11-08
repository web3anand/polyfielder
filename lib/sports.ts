import axios from 'axios';

const API_KEY = process.env.API_SPORTS_KEY || process.env.NEXT_PUBLIC_API_SPORTS_KEY;

// API-Sports endpoints for different sports
const SPORTS_ENDPOINTS: Record<string, string> = {
  soccer: 'https://api-football-v1.p.rapidapi.com/v3',
  nba: 'https://api-nba-v1.p.rapidapi.com',
  nfl: 'https://api-nfl-v1.p.rapidapi.com',
  tennis: 'https://api-tennis.p.rapidapi.com',
  cricket: 'https://api-cricket.p.rapidapi.com',
};

export interface LiveFixture {
  id: number;
  sport: string;
  teams: { home: string; away: string };
  score: { home: number; away: number };
  status: string;
  time: string;
}

export const getLiveScores = async (sport: string): Promise<LiveFixture[]> => {
  // Return empty array if API key is not configured
  if (!API_KEY || API_KEY === 'undefined') {
    return [];
  }

  try {
    let endpoint = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': '',
      },
    };

    // Map sport to API endpoint
    switch (sport.toLowerCase()) {
      case 'soccer':
      case 'football':
        config.headers['X-RapidAPI-Host'] = 'api-football-v1.p.rapidapi.com';
        endpoint = `${SPORTS_ENDPOINTS.soccer}/fixtures?live=all`;
        break;
      case 'nba':
      case 'basketball':
        config.headers['X-RapidAPI-Host'] = 'api-nba-v1.p.rapidapi.com';
        endpoint = `${SPORTS_ENDPOINTS.nba}/games/live`;
        break;
      case 'nfl':
      case 'american-football':
        config.headers['X-RapidAPI-Host'] = 'api-nfl-v1.p.rapidapi.com';
        endpoint = `${SPORTS_ENDPOINTS.nfl}/games/live`;
        break;
      default:
        // Default to soccer API
        config.headers['X-RapidAPI-Host'] = 'api-football-v1.p.rapidapi.com';
        endpoint = `${SPORTS_ENDPOINTS.soccer}/fixtures?live=all`;
    }

    const res = await axios.get(endpoint, config);
    
    // Normalize response format
    if (sport.toLowerCase() === 'soccer' || sport.toLowerCase() === 'football') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return res.data.response?.map((fixture: any) => ({
        id: fixture.fixture.id,
        sport: 'soccer',
        teams: {
          home: fixture.teams.home.name,
          away: fixture.teams.away.name,
        },
        score: {
          home: fixture.goals.home ?? 0,
          away: fixture.goals.away ?? 0,
        },
        status: fixture.fixture.status.short,
        time: fixture.fixture.date,
      })) || [];
    }

    return res.data.response || [];
  } catch (error) {
    // Handle API errors gracefully - suppress common errors to avoid console spam
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Silently fail - user hasn't configured API key yet
        // console.warn(`API key invalid or missing for ${sport} live scores`);
      } else if (error.response?.status === 429) {
        // Silently fail - rate limit reached
        // console.warn(`Rate limit exceeded for ${sport} live scores`);
      }
    }
    return [];
  }
};

export const getHistoricalData = async (
  sport: string,
  query: string,
  dateRange?: { start: string; end: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> => {
  // Return empty array if API key is not configured
  if (!API_KEY || API_KEY === 'undefined') {
    return [];
  }

  try {
    let endpoint = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': '',
      },
    };

    // Build historical query based on sport
    switch (sport.toLowerCase()) {
      case 'soccer':
      case 'football':
        config.headers['X-RapidAPI-Host'] = 'api-football-v1.p.rapidapi.com';
        const date = dateRange?.start || '2024-01-01';
        endpoint = `${SPORTS_ENDPOINTS.soccer}/fixtures?date=${date}`;
        break;
      case 'nba':
      case 'basketball':
        config.headers['X-RapidAPI-Host'] = 'api-nba-v1.p.rapidapi.com';
        endpoint = `${SPORTS_ENDPOINTS.nba}/games?search=${encodeURIComponent(query)}`;
        break;
      default:
        config.headers['X-RapidAPI-Host'] = 'api-football-v1.p.rapidapi.com';
        endpoint = `${SPORTS_ENDPOINTS.soccer}/fixtures?date=${dateRange?.start || '2024-01-01'}`;
    }

    const res = await axios.get(endpoint, config);
    return res.data.response || [];
  } catch (error) {
    // Handle API errors gracefully - suppress common errors
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Silently fail - user hasn't configured API key yet
      } else if (error.response?.status === 429) {
        // Silently fail - rate limit reached
      }
    }
    return [];
  }
};

