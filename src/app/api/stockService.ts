import axios from 'axios';

// Use environment variable for API key in production
const API_KEY = 'VNN3BWUS1PW817TG'; //TODO: Change to environment variable

const BASE_URL = 'https://www.alphavantage.co/query';

// Interface for stock data
export interface StockData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  marketCap?: number;
}

// Interface for historical data point
export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Fetch Nifty 50 stocks list
export const fetchNifty50Stocks = async (): Promise<StockData[]> => {
  try {
    // For demo purposes, returning mock data
    // In a real app, you would call the actual API endpoint
    return mockNifty50Stocks;
  } catch (error) {
    console.error("Error fetching Nifty 50 stocks:", error);
    throw error;
  }
};

// Fetch Nifty 100 stocks list
export const fetchNifty100Stocks = async (): Promise<StockData[]> => {
  try {
    // For demo purposes, returning mock data
    // In a real app, you would call the actual API endpoint
    return mockNifty100Stocks;
  } catch (error) {
    console.error("Error fetching Nifty 100 stocks:", error);
    throw error;
  }
};

// Fetch stock details
export const fetchStockDetails = async (symbol: string): Promise<StockData> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: API_KEY
      }
    });

    const globalQuote = response.data['Global Quote'];
    
    if (!globalQuote) {
      throw new Error('No stock data found');
    }

    return {
      symbol: globalQuote['01. symbol'],
      price: parseFloat(globalQuote['05. price']),
      change: parseFloat(globalQuote['09. change']),
      changePercent: parseFloat(globalQuote['10. change percent'].replace('%', '')),
      high: parseFloat(globalQuote['03. high']),
      low: parseFloat(globalQuote['04. low']),
      volume: parseInt(globalQuote['06. volume']),
      previousClose: parseFloat(globalQuote['08. previous close'])
    };
  } catch (error) {
    console.error(`Error fetching stock details for ${symbol}:`, error);
    // Return mock data for demo or when API rate limit is reached
    return mockStockDetails(symbol);
  }
};

// Fetch historical data for a stock
export const fetchHistoricalData = async (
  symbol: string, 
  timeframe: 'daily' | 'weekly' | 'monthly' = 'daily',
  outputsize: 'compact' | 'full' = 'compact'
): Promise<HistoricalDataPoint[]> => {
  try {
    const functionName = timeframe === 'daily' 
      ? 'TIME_SERIES_DAILY' 
      : timeframe === 'weekly' 
        ? 'TIME_SERIES_WEEKLY' 
        : 'TIME_SERIES_MONTHLY';
        
    const response = await axios.get(BASE_URL, {
      params: {
        function: functionName,
        symbol,
        outputsize,
        apikey: API_KEY
      }
    });

    const timeSeries = response.data[`Time Series (${timeframe === 'daily' ? 'Daily' : timeframe === 'weekly' ? 'Weekly' : 'Monthly'})`];
    
    if (!timeSeries) {
      throw new Error('No historical data found');
    }

    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    })).reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    // Return mock data for demo or when API rate limit is reached
    return getMockHistoricalData(symbol);
  }
};

// Mock data for Nifty 50 stocks
const mockNifty50Stocks: StockData[] = [
  { symbol: 'RELIANCE.BSE', name: 'Reliance Industries', price: 2897.45, change: 23.56, changePercent: 0.82, high: 2910.50, low: 2865.30, volume: 3245678, previousClose: 2873.89, marketCap: 18534.67 },
  { symbol: 'TCS.BSE', name: 'Tata Consultancy Services', price: 3547.80, change: -12.35, changePercent: -0.35, high: 3560.20, low: 3521.45, volume: 1876543, previousClose: 3560.15, marketCap: 12987.45 },
  { symbol: 'HDFCBANK.BSE', name: 'HDFC Bank', price: 1678.90, change: 15.78, changePercent: 0.95, high: 1685.60, low: 1663.20, volume: 2987654, previousClose: 1663.12, marketCap: 9876.23 },
  { symbol: 'INFY.BSE', name: 'Infosys', price: 1456.78, change: -5.67, changePercent: -0.39, high: 1470.25, low: 1450.30, volume: 1765432, previousClose: 1462.45, marketCap: 6543.21 },
  { symbol: 'HINDUNILVR.BSE', name: 'Hindustan Unilever', price: 2345.67, change: 18.45, changePercent: 0.79, high: 2360.75, low: 2330.90, volume: 1234567, previousClose: 2327.22, marketCap: 5432.10 },
  { symbol: 'ICICIBANK.BSE', name: 'ICICI Bank', price: 987.45, change: 9.87, changePercent: 1.01, high: 995.60, low: 975.30, volume: 3456789, previousClose: 977.58, marketCap: 7654.32 },
  { symbol: 'BHARTIARTL.BSE', name: 'Bharti Airtel', price: 876.54, change: -3.21, changePercent: -0.37, high: 880.90, low: 870.25, volume: 2345678, previousClose: 879.75, marketCap: 4567.89 },
  { symbol: 'KOTAKBANK.BSE', name: 'Kotak Mahindra Bank', price: 1765.43, change: 12.34, changePercent: 0.70, high: 1780.20, low: 1754.50, volume: 1456789, previousClose: 1753.09, marketCap: 4321.09 },
  { symbol: 'SBIN.BSE', name: 'State Bank of India', price: 654.32, change: 7.89, changePercent: 1.22, high: 660.75, low: 645.60, volume: 4567890, previousClose: 646.43, marketCap: 6789.01 },
  { symbol: 'BAJFINANCE.BSE', name: 'Bajaj Finance', price: 7654.32, change: -34.56, changePercent: -0.45, high: 7700.90, low: 7630.25, volume: 987654, previousClose: 7688.88, marketCap: 5678.90 }
];

// Mock data for Nifty 100 stocks - including Nifty 50 plus additional stocks
const mockNifty100Stocks: StockData[] = [
  ...mockNifty50Stocks,
  { symbol: 'ASIANPAINT.BSE', name: 'Asian Paints', price: 3214.56, change: 24.67, changePercent: 0.77, high: 3230.45, low: 3195.60, volume: 876543, previousClose: 3189.89, marketCap: 3456.78 },
  { symbol: 'AXISBANK.BSE', name: 'Axis Bank', price: 943.21, change: -7.65, changePercent: -0.80, high: 955.40, low: 940.30, volume: 2654321, previousClose: 950.86, marketCap: 4567.89 },
  { symbol: 'BAJAJFINSV.BSE', name: 'Bajaj Finserv', price: 1543.76, change: 12.43, changePercent: 0.81, high: 1555.60, low: 1530.20, volume: 765432, previousClose: 1531.33, marketCap: 3214.56 },
  { symbol: 'HCLTECH.BSE', name: 'HCL Technologies', price: 1176.54, change: 5.43, changePercent: 0.46, high: 1180.90, low: 1165.30, volume: 987654, previousClose: 1171.11, marketCap: 3654.32 },
  { symbol: 'TITAN.BSE', name: 'Titan Company', price: 2765.43, change: -15.67, changePercent: -0.56, high: 2790.45, low: 2745.60, volume: 654321, previousClose: 2781.10, marketCap: 2987.65 }
];

// Mock function to get stock details when API call fails
const mockStockDetails = (symbol: string): StockData => {
  // Try to find the stock in our mock data
  const stockFromMock = [...mockNifty100Stocks].find(stock => stock.symbol === symbol);
  
  if (stockFromMock) {
    return stockFromMock;
  }
  
  // If not found, return generic mock data
  return {
    symbol,
    name: symbol.split('.')[0],
    price: 1000 + Math.random() * 2000,
    change: Math.random() * 40 - 20,
    changePercent: Math.random() * 4 - 2,
    high: 1100 + Math.random() * 2000,
    low: 900 + Math.random() * 1800,
    volume: Math.floor(500000 + Math.random() * 5000000),
    previousClose: 1000 + Math.random() * 2000,
    marketCap: 1000 + Math.random() * 10000
  };
};

// Mock function to generate historical data
const getMockHistoricalData = (symbol: string): HistoricalDataPoint[] => {
  const today = new Date();
  const data: HistoricalDataPoint[] = [];
  
  // Generate 100 days of data
  for (let i = 100; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Base price - different for each symbol
    const basePrice = (symbol.charCodeAt(0) + symbol.charCodeAt(1)) % 1000 + 500;
    
    // Add some randomness and trend
    const trendFactor = Math.sin(i / 10) * 50;
    const randomFactor = Math.random() * 20 - 10;
    
    const close = basePrice + trendFactor + randomFactor;
    const open = close - (Math.random() * 20 - 10);
    const high = Math.max(open, close) + Math.random() * 10;
    const low = Math.min(open, close) - Math.random() * 10;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: Math.floor(100000 + Math.random() * 1000000)
    });
  }
  
  return data;
}; 