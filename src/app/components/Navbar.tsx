'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaChartLine, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-indigo-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
          <FaChartLine className="text-2xl" />
          <span>StockViz</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-indigo-200 transition-colors">
            Home
          </Link>
          <Link href="/stocks/nifty50" className="hover:text-indigo-200 transition-colors">
            Nifty 50
          </Link>
          <Link href="/stocks/nifty100" className="hover:text-indigo-200 transition-colors">
            Nifty 100
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-2 px-2">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="block px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/stocks/nifty50" 
              className="block px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Nifty 50
            </Link>
            <Link 
              href="/stocks/nifty100" 
              className="block px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Nifty 100
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 