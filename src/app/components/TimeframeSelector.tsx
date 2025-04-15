'use client';

import React from 'react';

interface TimeframeSelectorProps {
  currentTimeframe: 'daily' | 'weekly' | 'monthly';
  onTimeframeChange: (timeframe: 'daily' | 'weekly' | 'monthly') => void;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  currentTimeframe,
  onTimeframeChange,
}) => {
  const timeframes = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ] as const;

  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-inner">
      {timeframes.map((timeframe) => (
        <button
          key={timeframe.value}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentTimeframe === timeframe.value
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => onTimeframeChange(timeframe.value)}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector; 