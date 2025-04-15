'use client';

import { useState, useMemo } from 'react';
import { FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaSortAmountUp, FaSortAmountDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { StockData } from '../api/stockService';
import StockCard from './StockCard';

interface StockListProps {
  stocks: StockData[];
  title: string;
}

type SortField = 'name' | 'price' | 'change' | 'volume';
type SortDirection = 'asc' | 'desc';

const StockList: React.FC<StockListProps> = ({ stocks, title }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Number of stocks per page

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedStocks = useMemo(() => {
    // First filter by search term
    const filtered = stocks.filter((stock) => {
      const nameOrSymbol = `${stock.name || ''} ${stock.symbol}`.toLowerCase();
      return nameOrSymbol.includes(searchTerm.toLowerCase());
    });

    // Then sort by the selected field
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'name') {
        const aName = (a.name || a.symbol).toLowerCase();
        const bName = (b.name || b.symbol).toLowerCase();
        comparison = aName.localeCompare(bName);
      } else if (sortField === 'price') {
        comparison = a.price - b.price;
      } else if (sortField === 'change') {
        comparison = a.changePercent - b.changePercent;
      } else if (sortField === 'volume') {
        comparison = a.volume - b.volume;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [stocks, searchTerm, sortField, sortDirection]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedStocks.length / itemsPerPage);
  
  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedStocks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedStocks, currentPage]);

  // Page navigation handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="container mx-auto py-6 px-4">
        {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}

        {/* Search and Sort Controls */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className={`flex items-center px-4 py-2 rounded text-sm ${
                  sortField === 'name'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => handleSort('name')}
              >
                Name
                {sortField === 'name' && (
                  sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                )}
              </button>
              
              <button
                className={`flex items-center px-4 py-2 rounded text-sm ${
                  sortField === 'price'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => handleSort('price')}
              >
                Price
                {sortField === 'price' && (
                  sortDirection === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                )}
              </button>
              
              <button
                className={`flex items-center px-4 py-2 rounded text-sm ${
                  sortField === 'change'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => handleSort('change')}
              >
                % Change
                {sortField === 'change' && (
                  sortDirection === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                )}
              </button>
              
              <button
                className={`flex items-center px-4 py-2 rounded text-sm ${
                  sortField === 'volume'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => handleSort('volume')}
              >
                Volume
                {sortField === 'volume' && (
                  sortDirection === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stock counts and totals */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredAndSortedStocks.length > 0 ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredAndSortedStocks.length)} of ` : ''}{filteredAndSortedStocks.length} stock{filteredAndSortedStocks.length !== 1 ? 's' : ''}
        </div>

        {/* Stock List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.length > 0 ? (
            currentData.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
              No stocks found matching your search criteria.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <FaChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      page === currentPage 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <FaChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockList; 