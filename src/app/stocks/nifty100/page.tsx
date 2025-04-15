'use client';

import { useEffect, useState, useCallback } from 'react';
import { StockData } from '../../api/stockService';
import { fetchNSEStocks } from '../../api/indianStockService';
import StockList from '../../components/StockList';

export default function Nifty100Page() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStocks = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch stocks from Indian markets
      const nseStocks = await fetchNSEStocks();
      
      // Sort by market cap or trading volume
      const sortedStocks = [...nseStocks].sort((a, b) => 
        (b.marketCap || 0) - (a.marketCap || 0)
      );
      
      setStocks(sortedStocks);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stock data:', err);
      setError('Failed to load stocks. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStocks();
  };

  if (isLoading && !refreshing) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-red-600">
        <div className="text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Indian Stocks</h1>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className={`px-4 py-2 rounded ${
            refreshing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      <StockList stocks={stocks} title="BSE & NSE Stocks" />
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Powered by Finnhub API - Real-time market data</p>
        <p>Showing {stocks.length} stocks from BSE and NSE exchanges</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
} 