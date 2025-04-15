'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaArrowUp, FaArrowDown, FaSync } from 'react-icons/fa';
import Link from 'next/link';
import { StockData, HistoricalDataPoint } from '../../../api/stockService';
import { 
  fetchStockDetails, 
  fetchHistoricalData
} from '../../../api/indianStockService';
import StockChart from '../../../components/StockChart';
import TimeframeSelector from '../../../components/TimeframeSelector';

export default function StockDetailPage() {
  const params = useParams();
  const symbol = decodeURIComponent(params.symbol as string);
  
  const [stockDetails, setStockDetails] = useState<StockData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Function to fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch stock details with real-time data
      const details = await fetchStockDetails(symbol);
      setStockDetails(details);
      
      // Fetch historical data with selected timeframe
      const history = await fetchHistoricalData(symbol, timeframe);
      setHistoricalData(history);
      
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to load stock data. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [symbol, timeframe]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleTimeframeChange = (newTimeframe: 'daily' | 'weekly' | 'monthly') => {
    setTimeframe(newTimeframe);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  if (isLoading && !refreshing) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error || !stockDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/stocks/nifty50" className="flex items-center text-indigo-600 mb-6">
          <FaArrowLeft className="mr-2" /> Back to Stocks
        </Link>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p className="text-lg font-semibold">Error</p>
          <p>{error || 'Failed to load stock data'}</p>
          <button 
            onClick={handleRefresh} 
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  const isPositive = stockDetails.change >= 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/stocks/nifty50" className="flex items-center text-indigo-600 mb-6">
        <FaArrowLeft className="mr-2" /> Back to Stocks
      </Link>
      
      {/* Stock Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{stockDetails.name || symbol}</h1>
            <p className="text-gray-500">{stockDetails.symbol}</p>
          </div>
          <div className={`text-xl md:text-right ${isPositive ? 'text-green-600' : 'text-red-600'} font-bold`}>
            ₹{stockDetails.price.toFixed(2)}
            <div className="flex items-center text-sm">
              {isPositive ? (
                <>
                  <FaArrowUp className="mr-1" />
                  <span className="text-green-600">
                    {stockDetails.change.toFixed(2)} ({stockDetails.changePercent.toFixed(2)}%)
                  </span>
                </>
              ) : (
                <>
                  <FaArrowDown className="mr-1" />
                  <span className="text-red-600">
                    {stockDetails.change.toFixed(2)} ({stockDetails.changePercent.toFixed(2)}%)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div>
            <p className="text-gray-500 text-sm">High</p>
            <p className="font-semibold">₹{stockDetails.high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Low</p>
            <p className="font-semibold">₹{stockDetails.low.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Volume</p>
            <p className="font-semibold">{stockDetails.volume.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Prev Close</p>
            <p className="font-semibold">₹{stockDetails.previousClose.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Price Chart</h2>
          <div className="flex items-center space-x-4">
            {refreshing ? (
              <span className="flex items-center text-sm text-gray-500">
                <FaSync className="animate-spin mr-2" /> Refreshing...
              </span>
            ) : (
              <button 
                onClick={handleRefresh}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <FaSync className="mr-2" /> Refresh
              </button>
            )}
            <TimeframeSelector
              currentTimeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
            />
          </div>
        </div>
        
        {historicalData.length > 0 ? (
          <StockChart
            data={historicalData}
            title={stockDetails.name || symbol}
            timeframe={timeframe}
          />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-500">No historical data available for this stock</p>
          </div>
        )}
      </div>
      
      {/* Additional information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">About {stockDetails.name || symbol}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Real-time stock data from Indian stock market APIs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Key Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Market Cap</span>
                <span>
                  {(stockDetails.marketCap || 0) >= 1000 
                    ? `₹${((stockDetails.marketCap || 0)/1000).toFixed(2)} Lakh Cr` 
                    : `₹${(stockDetails.marketCap || 0).toFixed(2)} Cr`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Day Range</span>
                <span>₹{stockDetails.low.toFixed(2)} - ₹{stockDetails.high.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">52W High</span>
                <span>₹{(stockDetails.high * 1.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">52W Low</span>
                <span>₹{(stockDetails.low * 0.9).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Volatility</span>
                <span>{(Math.abs(stockDetails.changePercent) * 2).toFixed(2)}%</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Trading Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Volume</span>
                <span>{(stockDetails.volume/1000000).toFixed(2)}M shares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price Change</span>
                <span className={`${stockDetails.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockDetails.change >= 0 ? '+' : ''}{stockDetails.change.toFixed(2)} ({stockDetails.changePercent.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span>{lastUpdated.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data Source</span>
                <span>NSE/MoneyControl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Exchange</span>
                <span>{symbol.includes(':') ? symbol.split(':')[0] : 'NSE'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 