'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StockData } from './api/stockService';
import { fetchNSEStocks } from './api/indianStockService';
import StockList from './components/StockList';
import { FaSync } from 'react-icons/fa';

export default function Home() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      // Fetch stocks from our Indian stock service
      const stocks = await fetchNSEStocks();
      
      if (!stocks || stocks.length === 0) {
        throw new Error('No stocks data available');
      }
      
      setStocks(stocks);
      setError(null);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setError('Failed to load stocks. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStocks();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Indian Stock Market Dashboard</h1>
        
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Nifty Stocks</h2>
          <div className="flex space-x-4">
            {refreshing ? (
              <span className="flex items-center text-sm text-gray-500">
                <FaSync className="animate-spin mr-2" /> Refreshing...
              </span>
            ) : (
              <button 
                onClick={handleRefresh} 
                className="flex items-center text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                <FaSync className="mr-2" /> Refresh
              </button>
            )}
          </div>
        </div>
        
        {isLoading && !refreshing ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
            <p className="mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold">Nifty 50</h3>
                <Link href="/stocks/nifty50" className="text-indigo-600 hover:text-indigo-800">
                  View All Nifty 50
                </Link>
              </div>
              {/* Preview of available Nifty 50 stocks - limited by API performance considerations */}
              <StockList stocks={stocks.slice(0, 20)} title="" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold">Nifty 100</h3>
                <Link href="/stocks/nifty100" className="text-indigo-600 hover:text-indigo-800">
                  View All Nifty 100
                </Link>
              </div>
              {/* All available stocks are shown but API fetches are limited to ~20 stocks for performance */}
              <StockList stocks={stocks} title="" />
              <p className="text-xs text-gray-500 mt-2">
                Note: Some stocks may not be displayed due to API performance limitations. View full list from the link above.
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>Real-time market data from Indian stock exchanges</p>
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
