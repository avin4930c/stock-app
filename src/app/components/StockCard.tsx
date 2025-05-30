'use client';

import Link from 'next/link';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { StockData } from '../api/stockService';

interface StockCardProps {
  stock: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  // Ensure numerical values with safeguards to prevent NaN display issues
  const price = isNaN(stock.price) ? 0 : stock.price;
  const change = isNaN(stock.change) ? 0 : stock.change;
  const changePercent = isNaN(stock.changePercent) ? 0 : stock.changePercent;
  const high = isNaN(stock.high) ? price : stock.high;
  const low = isNaN(stock.low) ? price : stock.low;
  const volume = isNaN(stock.volume) ? 0 : stock.volume;
  const previousClose = isNaN(stock.previousClose) ? price : stock.previousClose;
  
  const isPositive = change >= 0;

  return (
    <Link href={`/stocks/detail/${encodeURIComponent(stock.symbol)}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{stock.name || stock.symbol}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stock.symbol}</p>
            </div>
            <div className={`text-right ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <div className="text-xl font-bold">₹{price.toFixed(2)}</div>
              <div className="flex items-center text-sm">
                {isPositive ? (
                  <FaArrowUp className="mr-1" />
                ) : (
                  <FaArrowDown className="mr-1" />
                )}
                <span>{Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">High: </span>
              <span className="font-medium text-gray-900 dark:text-white">₹{high.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Low: </span>
              <span className="font-medium text-gray-900 dark:text-white">₹{low.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Volume: </span>
              <span className="font-medium text-gray-900 dark:text-white">{volume.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Prev Close: </span>
              <span className="font-medium text-gray-900 dark:text-white">₹{previousClose.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StockCard; 