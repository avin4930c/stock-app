import axios from 'axios';
import { StockData, HistoricalDataPoint } from './stockService';

// Use environment variable for API key in production
const API_KEY = 'cvv2dv1r01qphtc8mosgcvv2dv1r01qphtc8mot0'; // Replace with your Finnhub API key

const BASE_URL = 'https://finnhub.io/api/v1';

// Define profile data interface
interface CompanyProfile {
  name?: string;
  marketCapitalization?: number;
  [key: string]: any;
}

// Standardized error handling
const handleApiError = (error: any, message: string) => {
  const errorMessage = error.response ? 
    `Error ${error.response.status}: ${error.response.data?.error || 'Unknown error'}` :
    error.message || 'Network error';
  
  console.error(`${message}: ${errorMessage}`);
  throw new Error(`${message}: ${errorMessage}`);
};

// Function to fetch real-time stock quote
export const fetchRealTimeStockData = async (symbol: string): Promise<StockData> => {
  try {
    // Get quote data
    const quoteResponse = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol,
        token: API_KEY
      }
    });

    // Get profile data (might fail for some symbols, especially Indian ones)
    let profileData: CompanyProfile = { name: symbol };
    try {
      const profileResponse = await axios.get(`${BASE_URL}/stock/profile2`, {
        params: {
          symbol,
          token: API_KEY
        }
      });
      profileData = profileResponse.data || profileData;
    } catch (profileError) {
      console.warn(`Could not fetch profile for ${symbol}, using default name`);
    }

    const quoteData = quoteResponse.data;
    
    // Check if we have valid quote data
    if (!quoteData || typeof quoteData.c !== 'number') {
      throw new Error(`Invalid quote data received for ${symbol}`);
    }

    // Handle zero prices or missing data with fallbacks
    const price = quoteData.c || 0;
    const previousClose = quoteData.pc || price;
    const change = quoteData.d || 0;
    const changePercent = quoteData.dp || 0;

    return {
      symbol: symbol,
      name: profileData.name || formatSymbolAsName(symbol),
      price,
      change,
      changePercent,
      high: quoteData.h || price * 1.05,
      low: quoteData.l || price * 0.95,
      volume: quoteData.v || 0,
      previousClose,
      marketCap: profileData.marketCapitalization || 0,
    };
  } catch (error) {
    return handleApiError(error, `Error fetching real-time data for ${symbol}`);
  }
};

// Helper function to convert symbol to readable name
const formatSymbolAsName = (symbol: string): string => {
  // Remove any exchange prefixes (e.g., "NSE:" or "BSE:")
  let name = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  
  // Replace any dots with spaces
  name = name.replace(/\./g, ' ');
  
  // Capitalize each word
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Fetch historical candle data
export const fetchHistoricalCandles = async (
  symbol: string,
  timeframe: 'daily' | 'weekly' | 'monthly' = 'daily',
  from = Math.floor(Date.now() / 1000) - 31536000, // 1 year ago
  to = Math.floor(Date.now() / 1000)
): Promise<HistoricalDataPoint[]> => {
  try {
    // Convert timeframe to resolution parameter
    const resolution = timeframe === 'daily' ? 'D' : timeframe === 'weekly' ? 'W' : 'M';
    
    const response = await axios.get(`${BASE_URL}/stock/candle`, {
      params: {
        symbol,
        resolution,
        from,
        to,
        token: API_KEY
      }
    });

    const candles = response.data;
    
    if (candles.s !== 'ok' || !candles.t || !candles.t.length) {
      throw new Error('No historical data found');
    }

    // Format data to match our interface
    const historicalData: HistoricalDataPoint[] = [];
    
    for (let i = 0; i < candles.t.length; i++) {
      historicalData.push({
        date: new Date(candles.t[i] * 1000).toISOString().split('T')[0],
        open: candles.o[i],
        high: candles.h[i],
        low: candles.l[i],
        close: candles.c[i],
        volume: candles.v[i]
      });
    }

    return historicalData;
  } catch (error) {
    return handleApiError(error, `Error fetching historical data for ${symbol}`);
  }
};

// Fetch stock symbols for BSE/NSE (Indian stocks)
export const fetchIndianStocks = async (exchange: 'BSE' | 'NSE'): Promise<StockData[]> => {
  try {
    // First, try to get all symbols from the exchange
    let symbols = [];
    try {
      const response = await axios.get(`${BASE_URL}/stock/symbol`, {
        params: {
          exchange,
          token: API_KEY
        }
      });
      symbols = response.data || [];
    } catch (symbolError) {
      console.warn(`Error fetching symbols for ${exchange}, using default symbols`);
      // Fallback to some common Indian stocks if the symbol lookup fails
      symbols = getDefaultIndianStocks(exchange);
    }
    
    if (!symbols.length) {
      symbols = getDefaultIndianStocks(exchange);
    }
    
    // Use a slice of symbols to avoid too many API calls (Finnhub has rate limits)
    const symbolsToFetch = symbols.slice(0, 30);
    
    // For each symbol, get the quote data
    const stockPromises = symbolsToFetch.map(async (stock: any) => {
      const symbol = typeof stock === 'string' ? stock : stock.symbol || '';
      if (!symbol) return null;
      
      try {
        return await fetchRealTimeStockData(symbol);
      } catch (e) {
        console.error(`Error fetching data for ${symbol}:`, e);
        return null;
      }
    });
    
    const stocks = await Promise.all(stockPromises);
    return stocks.filter((stock): stock is StockData => stock !== null);
  } catch (error) {
    console.error(`Error fetching ${exchange} stocks:`, error);
    // Return default stocks as fallback
    return getDefaultIndianStocks(exchange).map(symbol => ({
      symbol,
      name: formatSymbolAsName(symbol),
      price: 1000 + Math.random() * 2000,
      change: Math.random() * 40 - 20,
      changePercent: Math.random() * 4 - 2,
      high: 1100 + Math.random() * 2000,
      low: 900 + Math.random() * 1800,
      volume: Math.floor(500000 + Math.random() * 5000000),
      previousClose: 1000 + Math.random() * 2000,
      marketCap: 1000 + Math.random() * 10000
    }));
  }
};

// Default Indian stocks for fallback
const getDefaultIndianStocks = (exchange: 'BSE' | 'NSE'): string[] => {
  const prefix = exchange + ':';
  return [
    prefix + 'RELIANCE',
    prefix + 'TCS',
    prefix + 'HDFCBANK',
    prefix + 'INFY',
    prefix + 'ICICIBANK',
    prefix + 'SBIN',
    prefix + 'HINDUNILVR',
    prefix + 'BAJFINANCE',
    prefix + 'BHARTIARTL',
    prefix + 'KOTAKBANK',
    prefix + 'ASIANPAINT',
    prefix + 'AXISBANK',
    prefix + 'HDFC',
    prefix + 'ITC',
    prefix + 'TITAN',
    prefix + 'HCLTECH',
    prefix + 'MARUTI',
    prefix + 'ULTRACEMCO',
    prefix + 'BAJAJFINSV',
    prefix + 'WIPRO'
  ];
};

// Setup a WebSocket connection for real-time price updates
export const setupLiveDataConnection = (
  symbols: string[],
  onMessage: (data: any) => void
) => {
  if (typeof window === 'undefined') {
    return null; // Skip if running on server-side
  }

  try {
    const socket = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);

    // Connection opened -> Subscribe
    socket.addEventListener('open', () => {
      symbols.forEach(symbol => {
        socket.send(JSON.stringify({'type': 'subscribe', 'symbol': symbol}));
      });
      console.log('WebSocket connection established');
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Handle errors
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Handle disconnections
    socket.addEventListener('close', (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    });

    // Cleanup function
    return () => {
      try {
        // Unsubscribe
        symbols.forEach(symbol => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({'type': 'unsubscribe', 'symbol': symbol}));
          }
        });
        socket.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
    };
  } catch (error) {
    console.error('Error setting up WebSocket:', error);
    return null;
  }
}; 