import { NextRequest, NextResponse } from 'next/server';

interface PolymarketOutcome {
  title?: string;
  outcome?: string;
  price?: string;
  lastPrice?: string;
}

interface PolymarketSubMarket {
  id?: string;
  outcomes?: string[];
  outcomePrices?: string[];
  lastTradePrice?: number;
  bestBid?: number;
  bestAsk?: number;
  image?: string;
}

interface PolymarketMarket {
  id?: string;
  slug?: string;
  conditionId?: string;
  question?: string;
  title?: string;
  description?: string;
  liquidity?: string | number;
  totalLiquidity?: string | number;
  volume?: string | number;
  tags?: string[];
  outcomes?: PolymarketOutcome[];
  outcomePrices?: PolymarketOutcome[];
  initialYesPrice?: string;
  initialNoPrice?: string;
  yesPrice?: string;
  noPrice?: string;
  resolutionSource?: string;
  endDate?: string;
  endDateTimestamp?: string;
  imageUrl?: string;
  image?: string;
  icon?: string;
  markets?: PolymarketSubMarket[]; // Sub-markets with actual price data
  // Current market prices from orderbook
  lastTradePrice?: number;
  bestBid?: number;
  bestAsk?: number;
}

interface TransformedMarket {
  id: string;
  question: string;
  liquidity: number;
  odds: {
    yes: number;
    no: number;
  };
  sport: string;
  market_id: string;
  resolutionSource?: string;
  endDate?: string;
  imageUrl?: string;
}

/**
 * Sport to Tag ID mapping from Polymarket /sports endpoint
 * These tag IDs are used to filter markets by sport category
 * Reference: https://gamma-api.polymarket.com/sports
 * 
 * Tag IDs are extracted from the /sports endpoint response
 * Format: sport_id -> [primary_tag_id, ...other_tag_ids]
 */
const SPORT_TAG_IDS: Record<string, number[]> = {
  // Basketball - Official Polymarket tags
  'nba': [1, 745, 100639], // NBA (id:34)
  'wnba': [1, 100639, 100254], // WNBA (id:6)
  'ncaab': [1, 100149, 100639], // NCAA Basketball (id:1)
  'cbb': [1, 101178, 100639, 101954], // College Basketball (id:4)
  'basketball': [745, 100254, 100149, 101178], // All basketball
  
  // American Football - Official Polymarket tags
  'nfl': [1, 450, 100639], // NFL (id:10)
  'cfb': [1, 100351, 100639], // College Football (id:9)
  'football': [450, 100351], // American Football
  
  // Baseball - Official Polymarket tags
  'mlb': [1, 100639, 100381], // MLB (id:8)
  'baseball': [100381],
  
  // Hockey - Official Polymarket tags
  'nhl': [1, 899, 100639], // NHL (id:35)
  'hockey': [899],
  
  // Football/Soccer - Official Polymarket tags
  'epl': [1, 82, 306, 100639, 100350], // English Premier League (id:2)
  'lal': [1, 780, 100639, 100350], // La Liga (id:3)
  'laliga': [780], // La Liga (alternate)
  'ucl': [1, 100977, 100639, 1234, 100350], // UEFA Champions League (id:13)
  'bun': [1, 1494, 100639, 100350], // Bundesliga (id:7)
  'bundesliga': [1494],
  'fl1': [1, 100639, 102070, 100350], // Ligue 1 (id:11)
  'ligue1': [102070],
  'sea': [1, 100639, 101962, 100350], // Serie A (id:12)
  'seriea': [101962],
  'mls': [1, 100639, 100350, 100100], // MLS (id:33)
  'uef': [1, 100639, 100350, 102544], // UEFA Europa (id:28)
  'uel': [102544], // UEFA Europa League
  'uefa': [100350], // UEFA competitions
  'afc': [1, 100639, 100350, 101680], // AFC Asian Cup (id:15)
  'ofc': [1, 100639, 100350, 102566], // OFC Oceania (id:16)
  'fif': [1, 100639, 100350, 102539], // FIFA Friendlies (id:17)
  'ere': [1, 100639, 100350, 101735], // Eredivisie (id:18)
  'arg': [1, 100639, 100350, 102561], // Argentina Primera División (id:19)
  'itc': [1, 100639, 100350, 102008], // Coppa Italia (id:20)
  'mex': [1, 100639, 100350, 102448], // Liga MX (id:21)
  'lcs': [1, 100639, 100350, 102449], // Leagues Cup (id:22)
  'lib': [1, 100639, 100350, 102562], // Copa Libertadores (id:23)
  'sud': [1, 100639, 100350, 102563], // Copa Sudamericana (id:24)
  'tur': [1, 100639, 100350, 102564], // Süper Lig (id:25)
  'con': [1, 100639, 100350, 100787], // CONMEBOL (id:26)
  'cof': [1, 100639, 100350, 101280], // Coupe de France (id:27)
  'caf': [1, 100639, 100350, 102540], // CAF Africa (id:29)
  'rus': [1, 100639, 100350, 102593], // Russian Premier League (id:30)
  'efa': [1, 100639, 100350, 102594], // FA Cup (id:31)
  'efl': [1, 100639, 100350, 102595], // EFL Cup (id:32)
  
  // Aliases and combined tags
  'fifa-friendlies': [102539],
  'africa-wc-qualifiers': [102540],
  'oceania-wc-qualifiers': [102566],
  'asia-wc-qualifiers': [101680],
  'super-lig': [102564],
  'liga-mx': [102448],
  'copa-libertadores': [102562],
  'eredivisie': [101735],
  'coppa-italia': [102008],
  'copa-sudamericana': [102563],
  'russian-premier': [102593],
  'fa-cup': [102594],
  'efl-cup': [102595],
  'coupe-de-france': [101280],
  'soccer': [82, 306, 780, 100350, 100977, 1494, 102070, 101962, 100100],
  
  // Cricket - Official Polymarket tags (tag 517 has active T20/ODI markets)
  'cricket': [517], // Cricket - T20/ODI/Test matches (tag 517 is most active)
  'ipl': [101977, 517, 518], // Indian Premier League (IPL-specific is 101977)
  't20': [517], // T20 International (tag 517 has active markets)
  'odi': [517], // ODI also uses tag 517
  't20-international': [517],
  'test-international': [517], // Test matches also in tag 517
  
  // Sports without tags (use text matching)
  'tennis': [],
  'atp': [],
  'wta': [],
  'golf': [],
  'mma': [],
  'formula-1': [],
  'f1': [],
  'chess': [],
  'boxing': [],
  'esports': [],
  'counter-strike': [],
  'cs2': [],
  'lol': [],
  'dota': [],
  'valorant': [],
};

/**
 * Fetch real markets from Polymarket Gamma API with pagination
 * Uses tag_id filtering when sport is specified (recommended approach)
 * Reference: https://docs.polymarket.com/developers/gamma-markets-api/fetch-markets-guide
 * 
 * For cricket/IPL: Uses tag_id=101977 to filter cricket markets
 * This is more reliable than text matching
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get('sport') || 'all';
    const minLiquidity = searchParams.get('minLiquidity') || '100';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build API URL with tag_id filtering if sport is specified
    const sportLower = sport !== 'all' ? sport.toLowerCase() : '';
    
    // For cricket and other low-volume sports, use a different strategy
    const isCricket = ['cricket', 'ipl', 't20', 'odi', 'test-international'].includes(sportLower);
    const isLowVolumeSport = ['golf', 'mma', 'chess', 'boxing'].includes(sportLower);
    
    // Fetch markets from Polymarket Gamma API
    // Use tag_id filtering when available for efficiency
    const maxPerRequest = 500; // API limit
    const minLiquidityNum = parseFloat(minLiquidity);
    
    // Get tag IDs for the sport if available
    // For main categories, aggregate all sub-sport tags
    let sportTagIds: number[] | null = null;
    if (sport !== 'all') {
      // Map main categories to their sub-sports
      const sportMapping: Record<string, string[]> = {
        'basketball': ['nba', 'wnba', 'ncaab', 'cbb'],
        'football': ['nfl', 'cfb'],
        'baseball': ['mlb'],
        'hockey': ['nhl'],
        'soccer': ['epl', 'lal', 'ucl', 'bun', 'fl1', 'sea', 'mls', 'uef', 'afc', 'fif', 'ere', 'arg', 'itc', 'mex', 'lib', 'sud', 'tur', 'cof', 'rus', 'efa', 'efl'],
        'cricket': ['cricket', 'ipl', 't20', 'odi'],
        'tennis': ['tennis'],
      };
      
      const subSports = sportMapping[sportLower];
      if (subSports) {
        // Aggregate all tags from sub-sports
        const allTags = new Set<number>();
        subSports.forEach(subSport => {
          const tags = SPORT_TAG_IDS[subSport];
          if (tags && tags.length > 0) {
            tags.forEach(tag => allTags.add(tag));
          }
        });
        sportTagIds = Array.from(allTags);
      } else {
        // Direct lookup for specific sport codes
        sportTagIds = SPORT_TAG_IDS[sportLower] || null;
      }
    }
    
    const useTagFilter = sportTagIds && sportTagIds.length > 0; // Use tag filtering when available
    
    // Adjust fetch strategy based on whether we use tag filtering
    const totalToFetch = sport === 'all' 
      ? limit 
      : useTagFilter 
        ? Math.min(500, limit * 5) // Tag filtering is accurate, fetch less
        : Math.min(2000, limit * 20); // Text filtering needs more candidates
    
    let allFetchedMarkets: any[] = [];
    let currentOffset = offset;
    
    // Fetch markets in batches until we have enough
    while (allFetchedMarkets.length < totalToFetch) {
      const batchLimit = Math.min(maxPerRequest, totalToFetch - allFetchedMarkets.length);
      
      // Build API URL with tag_id filtering if available
      let apiUrl = `https://gamma-api.polymarket.com/markets?closed=false&limit=${batchLimit}&offset=${currentOffset}`;
      
      // Add tag_id filter for supported sports (more efficient than text matching)
      if (useTagFilter && sportTagIds && sportTagIds.length > 0) {
        apiUrl += `&tag_id=${sportTagIds[0]}`; // Use primary tag
      }

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
        break; // Stop on error
      }
      
      const batchMarkets = await response.json();
      
      if (!batchMarkets || batchMarkets.length === 0) {
        break; // No more markets
      }
      
      allFetchedMarkets = allFetchedMarkets.concat(batchMarkets);
      currentOffset += batchMarkets.length;
      
      // If we got fewer than requested, we've reached the end
      if (batchMarkets.length < batchLimit) {
        break;
    }

      // For tag-filtered sports, stop earlier since results are already accurate
      if (useTagFilter && allFetchedMarkets.length >= 200) {
        break;
      }
      
      // For text-filtered sports, fetch more candidates
      if (!useTagFilter && sport !== 'all' && allFetchedMarkets.length >= 1000) {
        break;
      }
    }
    
    // Use the fetched markets
    const marketsArray = allFetchedMarkets;

    // Determine if there are more results
    // Note: If we got fewer results than requested, we've reached the end
    const hasMore = marketsArray.length >= limit;
    const nextOffset = offset + marketsArray.length;

    // Filter and transform markets
    const allMarkets = (marketsArray || [])
      .map((market: PolymarketMarket): TransformedMarket | null => {
        // Extract odds from outcomes - handle different data structures
        // Gamma API can return outcomes in various formats:
        // 1. Array of {title: "Yes"/"No", price: "0.55"}
        // 2. Array of {outcome: "Yes"/"No", price: "0.55"}
        // 3. Direct yesPrice/noPrice fields
        // 4. outcomePrices array (can be string or array)
        // 5. outcomes can be a JSON string like '["Yes", "No"]'
        
        // Parse outcomes if it's a string
        let outcomes: any[] = [];
        if (market.outcomes) {
          if (typeof market.outcomes === 'string') {
            try {
              outcomes = JSON.parse(market.outcomes);
            } catch {
              outcomes = [];
            }
          } else if (Array.isArray(market.outcomes)) {
            outcomes = market.outcomes;
          }
        }
        
        // Parse outcomePrices if it exists and is a string
        let outcomePrices: any[] = [];
        if (market.outcomePrices) {
          if (typeof market.outcomePrices === 'string') {
            try {
              outcomePrices = JSON.parse(market.outcomePrices);
            } catch {
              outcomePrices = [];
            }
          } else if (Array.isArray(market.outcomePrices)) {
            outcomePrices = market.outcomePrices;
          }
        }
        
        // Use outcomePrices if available, otherwise use outcomes
        if (outcomePrices.length === 0 && outcomes.length > 0) {
          // If outcomes is just ["Yes", "No"], we need to get prices from elsewhere
          outcomes = outcomes;
        }
        
        // Try to find YES outcome - check multiple possible formats
        let yesOutcome = outcomes.find((o: any) => {
          if (typeof o === 'string') {
            return o.toLowerCase() === 'yes' || o.toLowerCase() === 'y';
          }
          const title = (o?.title || o?.outcome || '').toLowerCase();
          return title === 'yes' || title === 'y';
        });
        
        // Try to find NO outcome
        let noOutcome = outcomes.find((o: any) => {
          if (typeof o === 'string') {
            return o.toLowerCase() === 'no' || o.toLowerCase() === 'n';
          }
          const title = (o?.title || o?.outcome || '').toLowerCase();
          return title === 'no' || title === 'n';
        });

        // If outcomes array exists but we didn't find Yes/No, try index-based (first = Yes, second = No)
        if (outcomes.length >= 2 && (!yesOutcome || !noOutcome)) {
          if (!yesOutcome && outcomes[0]) {
            yesOutcome = outcomes[0];
          }
          if (!noOutcome && outcomes[1]) {
            noOutcome = outcomes[1];
        }
        }

        // Extract prices - simplified priority: lastTradePrice > outcomePrices > defaults
        // Gamma API most reliable source for binary markets is lastTradePrice
        let yesPrice = 0.5;
        let noPrice = 0.5;
        
        const firstMarket = market.markets?.[0];
        
        // Priority 1: lastTradePrice (most accurate for active binary markets)
        if (firstMarket?.lastTradePrice !== undefined && firstMarket.lastTradePrice > 0) {
          yesPrice = firstMarket.lastTradePrice;
          noPrice = 1 - yesPrice;
        } else if (market.lastTradePrice !== undefined && market.lastTradePrice > 0) {
          yesPrice = market.lastTradePrice;
          noPrice = 1 - yesPrice;
        }
        // Priority 2: outcomePrices array
        else if (firstMarket?.outcomePrices) {
          const prices = typeof firstMarket.outcomePrices === 'string' 
            ? JSON.parse(firstMarket.outcomePrices)
            : firstMarket.outcomePrices;
          if (Array.isArray(prices) && prices.length >= 2) {
            yesPrice = parseFloat(String(prices[0])) || 0.5;
            noPrice = parseFloat(String(prices[1])) || 0.5;
          }
        } else if (outcomePrices.length >= 2) {
          yesPrice = parseFloat(String(outcomePrices[0])) || 0.5;
          noPrice = parseFloat(String(outcomePrices[1])) || 0.5;
        }
        // Priority 3: bestAsk/bestBid (fallback for orderbook data)
        else if (firstMarket?.bestAsk !== undefined && firstMarket.bestAsk > 0 && firstMarket.bestAsk < 1) {
          yesPrice = firstMarket.bestAsk;
          noPrice = 1 - yesPrice;
        } else if (market.bestAsk !== undefined && market.bestAsk > 0 && market.bestAsk < 1) {
          yesPrice = market.bestAsk;
          noPrice = 1 - yesPrice;
        }
        
        // Ensure prices are valid numbers between 0 and 1
        let yesPriceNum = Math.max(0, Math.min(1, typeof yesPrice === 'number' ? yesPrice : parseFloat(yesPrice) || 0.5));
        let noPriceNum = Math.max(0, Math.min(1, typeof noPrice === 'number' ? noPrice : parseFloat(noPrice) || 0.5));
        
        // Ensure they sum to 1 (normalize)
        const total = yesPriceNum + noPriceNum;
        if (total > 0 && Math.abs(total - 1.0) > 0.01) {
          // Only normalize if sum is significantly different from 1
          yesPriceNum = yesPriceNum / total;
          noPriceNum = noPriceNum / total;
        }
        
        const normalizedYes = yesPriceNum;
        const normalizedNo = noPriceNum;

        // Extract sport from question and description
        // Note: The API doesn't return tags field, so we rely on text matching
        const question = (market.question || market.title || '').toLowerCase();
        const description = (market.description || '').toLowerCase();
        const combinedText = `${question} ${description}`;
        
        let detectedSport = 'general';
        
        // Cricket detection - ONLY explicit cricket terms with word boundaries
        const isCricketMatch = 
          // Must contain the word "cricket" as a whole word
          /\bcricket\b/.test(combinedText) ||
          // OR very specific cricket-only terms as whole words
          /\bipl\b/.test(combinedText) ||
          combinedText.includes('indian premier league') ||
          combinedText.includes('odi series') ||
          combinedText.includes('t20 series') ||
          combinedText.includes('t20 international') ||
          combinedText.includes('test cricket') ||
          /\bbcci\b/.test(combinedText);
        
        if (isCricketMatch) {
          detectedSport = 'cricket';
        }
        // Basketball (NBA, WNBA, NCAA, etc.)
        else if (
          combinedText.includes('nba') ||
          combinedText.includes('wnba') ||
          combinedText.includes('ncaa basketball') ||
          combinedText.includes('basketball') ||
          combinedText.includes('college basketball') ||
          combinedText.includes('lakers') ||
          combinedText.includes('warriors') ||
          combinedText.includes('celtics')
        ) {
          detectedSport = 'basketball';
        }
        // American Football (NFL, CFB)
        else if (
          combinedText.includes('nfl') ||
          combinedText.includes('american football') ||
          combinedText.includes('college football') ||
          (combinedText.includes('football') && !combinedText.includes('soccer') && !combinedText.includes('premier league'))
        ) {
          detectedSport = 'football';
        }
        // Baseball (MLB, etc.)
        else if (
          combinedText.includes('mlb') ||
          combinedText.includes('baseball')
        ) {
          detectedSport = 'baseball';
        }
        // Hockey (NHL, etc.)
        else if (
          combinedText.includes('nhl') ||
          combinedText.includes('hockey')
        ) {
          detectedSport = 'hockey';
        }
        // Soccer/Football (all leagues)
        else if (
          combinedText.includes('soccer') ||
          combinedText.includes('premier league') ||
          combinedText.includes('champions league') ||
          combinedText.includes('la liga') ||
          combinedText.includes('bundesliga') ||
          combinedText.includes('ligue 1') ||
          combinedText.includes('serie a') ||
          combinedText.includes('mls') ||
          combinedText.includes('fifa') ||
          combinedText.includes('uefa') ||
          combinedText.includes('copa')
        ) {
          detectedSport = 'soccer';
        }
        // Tennis
        else if (
          combinedText.includes('tennis') ||
          combinedText.includes('wimbledon') ||
          (combinedText.includes('us open') && combinedText.includes('tennis')) ||
          combinedText.includes('roland garros') ||
          combinedText.includes('atp') ||
          combinedText.includes('wta')
        ) {
          detectedSport = 'tennis';
        }

        // Extract image URL from various possible fields
        const imageUrl = market.imageUrl || market.image || market.icon || firstMarket?.image;

        // Ensure we have a valid ID
        const marketId = market.id || market.slug || market.conditionId || `market-${Date.now()}-${Math.random()}`;
        
        if (!marketId || marketId === '') {
          // Skip markets without valid IDs
          return null;
        }

        return {
          id: marketId,
          question: market.question || market.title || market.description || 'Market',
          liquidity: parseFloat(String(market.liquidity || market.totalLiquidity || market.volume || '0')),
          odds: {
            yes: normalizedYes,
            no: normalizedNo,
          },
          sport: detectedSport,
          market_id: marketId,
          resolutionSource: market.resolutionSource,
          endDate: market.endDate || market.endDateTimestamp,
          imageUrl: imageUrl || undefined,
        };
      })
      .filter((market): market is TransformedMarket => market !== null); // Remove null markets
    
    // Don't sort by liquidity - preserve API order (volume or liquidity based on sport)

    // Filter by sport and minLiquidity AFTER transformation
    // Trust the detected sport from the transformation phase (which has strict rules)
    let markets = allMarkets;
    
    // Apply sport filter
    if (sport !== 'all') {
      const sportLower = sport.toLowerCase();
      markets = markets.filter((market) => {
        // If tag filtering was used, trust all results (already filtered by API)
        if (useTagFilter) {
          return true;
        }
        // Otherwise, check detected sport matches the requested sport
        return market.sport.toLowerCase() === sportLower;
      });
    }
    
    // Apply minLiquidity filter
    if (minLiquidityNum > 0) {
      markets = markets.filter((market) => market.liquidity >= minLiquidityNum);
    }

    return NextResponse.json({
      success: true,
      markets,
      count: markets.length,
      hasMore: sport === 'all' ? hasMore : false, // Only paginate for "all" sports
      nextOffset: sport === 'all' ? nextOffset : offset, // Reset offset if filtering
      totalFetched: nextOffset, // Total markets fetched so far
      filtered: sport !== 'all', // Indicate if results were filtered
      debug: {
        sport,
        usedTagId: sport !== 'all' && SPORT_TAG_IDS[sport.toLowerCase()]?.[0] || null,
        totalMarketsFetched: allFetchedMarkets.length,
        totalMarketsBeforeFilter: allMarkets.length,
        marketsAfterFilter: markets.length,
        sampleMarkets: markets.slice(0, 3).map(m => ({ 
          sport: m.sport, 
          question: (m.question || '').substring(0, 50),
          yesOdds: `${(m.odds.yes * 100).toFixed(1)}%`,
          noOdds: `${(m.odds.no * 100).toFixed(1)}%`,
          liquidity: m.liquidity,
        })),
      },
    });
  } catch (error) {
    // Return error details for debugging
    return NextResponse.json(
      {
        success: false,
        markets: [],
        count: 0,
        hasMore: false,
        nextOffset: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorDetails: error instanceof Error ? error.stack : String(error),
        note: 'Gamma API unavailable, try Supabase or fallback sources',
      },
      { status: 200 }
    );
  }
}

