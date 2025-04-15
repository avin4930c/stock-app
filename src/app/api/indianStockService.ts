import axios from 'axios';
import { StockData, HistoricalDataPoint } from './stockService';

// Function to fetch NSE (National Stock Exchange) stock data
export const fetchNSEStocks = async (): Promise<StockData[]> => {
  try {
    // Use NSE India API to get stock data
    const response = await axios.get('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    });

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from NSE API');
    }

    // Map NSE data format to our StockData interface
    return response.data.data.map((item: any) => ({
      symbol: `NSE:${item.symbol}`,
      name: item.meta.companyName || item.symbol,
      price: parseFloat(item.lastPrice),
      change: parseFloat(item.change),
      changePercent: parseFloat(item.pChange),
      high: parseFloat(item.dayHigh),
      low: parseFloat(item.dayLow),
      volume: parseInt(item.totalTradedVolume || 0),
      previousClose: parseFloat(item.previousClose),
      marketCap: parseFloat(item.marketCap || 0) / 10000000, // Convert to Crores
    }));
  } catch (error) {
    console.error('Error fetching NSE stock data:', error);
    // Fallback to alternative API source using moneycontrol
    return fetchStocksFromMoneyControl();
  }
};

// Fallback to fetch data from MoneyControl
const fetchStocksFromMoneyControl = async (): Promise<StockData[]> => {
  try {
    const stockSymbols = getNifty50Symbols();
    const stocks: StockData[] = [];

    // Fetch data for each stock from MoneyControl
    for (const stockInfo of stockSymbols.slice(0, 20)) { // Limit to 20 for performance
      try {
        const response = await axios.get(`https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/${stockInfo.symbol}`);
        
        if (response.data && response.data.data) {
          const data = response.data.data;
          stocks.push({
            symbol: `NSE:${stockInfo.symbol}`,
            name: stockInfo.name,
            price: parseFloat(data.pricecurrent),
            change: parseFloat(data.pricechange),
            changePercent: parseFloat(data.pricepercentchange),
            high: parseFloat(data.HIGH),
            low: parseFloat(data.LOW),
            volume: parseInt(data.VOLUME || 0),
            previousClose: parseFloat(data.priceprevclose),
            marketCap: 0, // Not available from this API
          });
        }
      } catch (err) {
        console.error(`Error fetching data for ${stockInfo.symbol}:`, err);
      }
    }

    return stocks;
  } catch (error) {
    console.error('Error fetching MoneyControl data:', error);
    // Return dummy data as last resort
    return getDummyNifty50Data();
  }
};

// Fetch historical data for a specific stock
export const fetchHistoricalData = async (
  symbol: string,
  timeframe: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<HistoricalDataPoint[]> => {
  try {
    // Extract pure symbol without exchange prefix
    const pureSym = symbol.includes(':') ? symbol.split(':')[1] : symbol;
    
    // For real implementation, you would fetch from an API like Yahoo Finance
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (timeframe === 'daily' ? 86400 * 90 : timeframe === 'weekly' ? 86400 * 365 : 86400 * 730);
    
    const interval = timeframe === 'daily' ? '1d' : timeframe === 'weekly' ? '1wk' : '1mo';
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${pureSym}.NS?period1=${startDate}&period2=${endDate}&interval=${interval}&includePrePost=false`;
    
    const response = await axios.get(url);
    
    if (!response.data || !response.data.chart || !response.data.chart.result || !response.data.chart.result[0]) {
      throw new Error('Invalid response from Yahoo Finance API');
    }
    
    const result = response.data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    
    const historicalData: HistoricalDataPoint[] = [];
    
    for (let i = 0; i < timestamps.length; i++) {
      if (quotes.open[i] && quotes.high[i] && quotes.low[i] && quotes.close[i]) {
        historicalData.push({
          date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          open: quotes.open[i],
          high: quotes.high[i],
          low: quotes.low[i],
          close: quotes.close[i],
          volume: quotes.volume[i] || 0
        });
      }
    }
    
    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    // Return dummy historical data as fallback
    return generateDummyHistoricalData(symbol);
  }
};

// Fetch stock details for a specific stock
export const fetchStockDetails = async (symbol: string): Promise<StockData> => {
  try {
    // Extract pure symbol without exchange prefix
    const pureSym = symbol.includes(':') ? symbol.split(':')[1] : symbol;
    
    // Try to get data from MoneyControl
    const response = await axios.get(`https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/${pureSym}`);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from MoneyControl API');
    }
    
    const data = response.data.data;
    
    // Fetch company name from a list or another API if not available
    let name = pureSym;
    const knownStocks = getNifty50Symbols();
    const stockInfo = knownStocks.find(s => s.symbol === pureSym);
    if (stockInfo) {
      name = stockInfo.name;
    }
    
    // Make sure to handle NaN values by providing defaults
    const marketCap = parseFloat(data.MARKET_CAP) || 0;
    const price = parseFloat(data.pricecurrent) || 0;
    const change = parseFloat(data.pricechange) || 0;
    const changePercent = parseFloat(data.pricepercentchange) || 0;
    const high = parseFloat(data.HIGH) || price * 1.05;
    const low = parseFloat(data.LOW) || price * 0.95;
    const volume = parseInt(data.VOLUME) || 1000000;
    const previousClose = parseFloat(data.priceprevclose) || price - change;
    
    return {
      symbol: symbol,
      name: name,
      price: price,
      change: change,
      changePercent: changePercent,
      high: high,
      low: low,
      volume: volume,
      previousClose: previousClose,
      marketCap: marketCap / 10000000, // Convert to Crores with safeguard
    };
  } catch (error) {
    console.error(`Error fetching stock details for ${symbol}:`, error);
    
    // Try Yahoo Finance as fallback
    try {
      const pureSym = symbol.includes(':') ? symbol.split(':')[1] : symbol;
      const yahooResponse = await axios.get(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${pureSym}.NS`);
      
      if (yahooResponse.data && yahooResponse.data.quoteResponse && yahooResponse.data.quoteResponse.result && yahooResponse.data.quoteResponse.result.length > 0) {
        const quote = yahooResponse.data.quoteResponse.result[0];
        
        return {
          symbol: symbol,
          name: quote.longName || quote.shortName || pureSym,
          price: quote.regularMarketPrice || 1000,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          high: quote.regularMarketDayHigh || (quote.regularMarketPrice * 1.05),
          low: quote.regularMarketDayLow || (quote.regularMarketPrice * 0.95),
          volume: quote.regularMarketVolume || 1000000,
          previousClose: quote.regularMarketPreviousClose || (quote.regularMarketPrice - quote.regularMarketChange),
          marketCap: quote.marketCap ? quote.marketCap / 10000000 : 5000, // Convert to Crores with default
        };
      }
    } catch (yahooError) {
      console.error(`Error fetching Yahoo Finance data for ${symbol}:`, yahooError);
    }
    
    // Return reasonable default data for this stock
    return getDummyStockDetails(symbol);
  }
};

// Get dummy stock details when all APIs fail
const getDummyStockDetails = (symbol: string): StockData => {
  const pureSym = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  const stockInfo = getNifty50Symbols().find(s => s.symbol === pureSym);
  const name = stockInfo ? stockInfo.name : pureSym;
  
  // Generate realistic but random data based on the stock symbol to ensure consistency
  const symbolHash = pureSym.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = symbolHash / 1000;
  
  const basePrice = 1000 + (seed * 2000);
  const change = (seed > 0.5) ? (seed * 20) : -(seed * 20);
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol: symbol,
    name: name,
    price: basePrice,
    change: change,
    changePercent: changePercent,
    high: basePrice + (seed * 50),
    low: basePrice - (seed * 50),
    volume: Math.floor(500000 + (seed * 5000000)),
    previousClose: basePrice - change,
    marketCap: Math.floor(500 + (seed * 10000)), // In Crores
  };
};

// Generate dummy historical data
const generateDummyHistoricalData = (symbol: string): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const basePrice = 1000 + Math.random() * 2000;
  let currentPrice = basePrice;
  
  // Generate data for the last 90 days
  const today = new Date();
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add some randomness and trend
    const changePercent = (Math.random() - 0.48) * 2; // Slight upward bias
    const change = currentPrice * (changePercent / 100);
    currentPrice += change;
    
    const open = currentPrice - (Math.random() * 10);
    const close = currentPrice;
    const high = Math.max(open, close) + (Math.random() * 20);
    const low = Math.min(open, close) - (Math.random() * 20);
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: open,
      high: high,
      low: low,
      close: close,
      volume: Math.floor(100000 + Math.random() * 1000000)
    });
  }
  
  return data;
};

// Return dummy Nifty 50 data when all APIs fail
const getDummyNifty50Data = (): StockData[] => {
  return getNifty50Symbols().map(stockInfo => {
    const basePrice = 1000 + Math.random() * 2000;
    const change = Math.random() > 0.5 ? Math.random() * 20 : -Math.random() * 20;
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol: `NSE:${stockInfo.symbol}`,
      name: stockInfo.name,
      price: basePrice,
      change: change,
      changePercent: changePercent,
      high: basePrice + Math.random() * 50,
      low: basePrice - Math.random() * 50,
      volume: Math.floor(500000 + Math.random() * 5000000),
      previousClose: basePrice - change,
      marketCap: Math.floor(500 + Math.random() * 10000), // In Crores
    };
  });
};

// List of Nifty 50 symbols and names
const getNifty50Symbols = () => [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd." },
  { symbol: "TCS", name: "Tata Consultancy Services Ltd." },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd." },
  { symbol: "INFY", name: "Infosys Ltd." },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd." },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd." },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "HDFC", name: "Housing Development Finance Corporation Ltd." },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd." },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd." },
  { symbol: "ITC", name: "ITC Ltd." },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd." },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd." },
  { symbol: "AXISBANK", name: "Axis Bank Ltd." },
  { symbol: "WIPRO", name: "Wipro Ltd." },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd." },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd." },
  { symbol: "LT", name: "Larsen & Toubro Ltd." },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd." },
  { symbol: "TITAN", name: "Titan Company Ltd." },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd." },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd." },
  { symbol: "ADANIPORTS", name: "Adani Ports and Special Economic Zone Ltd." },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd." },
  { symbol: "NESTLEIND", name: "Nestle India Ltd." },
  { symbol: "TECHM", name: "Tech Mahindra Ltd." },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd." },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd." },
  { symbol: "NTPC", name: "NTPC Ltd." },
  { symbol: "POWERGRID", name: "Power Grid Corporation of India Ltd." },
  { symbol: "M&M", name: "Mahindra & Mahindra Ltd." },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd." },
  { symbol: "ONGC", name: "Oil & Natural Gas Corporation Ltd." },
  { symbol: "GRASIM", name: "Grasim Industries Ltd." },
  { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd." },
  { symbol: "BPCL", name: "Bharat Petroleum Corporation Ltd." },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance Company Ltd." },
  { symbol: "CIPLA", name: "Cipla Ltd." },
  { symbol: "DIVISLAB", name: "Divi's Laboratories Ltd." },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd." },
  { symbol: "COALINDIA", name: "Coal India Ltd." },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd." },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd." },
  { symbol: "IOC", name: "Indian Oil Corporation Ltd." },
  { symbol: "SBILIFE", name: "SBI Life Insurance Company Ltd." },
  { symbol: "BRITANNIA", name: "Britannia Industries Ltd." },
  { symbol: "UPL", name: "UPL Ltd." },
  { symbol: "HINDALCO", name: "Hindalco Industries Ltd." },
  { symbol: "SHREECEM", name: "Shree Cement Ltd." },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd." }
]; 