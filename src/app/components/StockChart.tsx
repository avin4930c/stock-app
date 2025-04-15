'use client';

import { useEffect, useRef, useState } from 'react';
import { HistoricalDataPoint } from '../api/stockService';
import { 
  createChart, 
  IChartApi, 
  CandlestickData, 
  HistogramData, 
  Time,
  UTCTimestamp
} from 'lightweight-charts';

interface StockChartProps {
  data: HistoricalDataPoint[];
  title?: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
}

const StockChart: React.FC<StockChartProps> = ({ data, title, timeframe }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [containerHeight, setContainerHeight] = useState<number>(400);

  useEffect(() => {
    // Clean up previous chart if it exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Return early if no container or data
    if (!chartContainerRef.current || !data.length) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: containerHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#333',
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#D1D5DB',
      },
      rightPriceScale: {
        borderColor: '#D1D5DB',
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
      },
      grid: {
        horzLines: {
          color: '#F3F4F6',
        },
        vertLines: {
          color: '#F3F4F6',
        },
      },
    });

    // Add candlestick series
    const mainSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#6B7280',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Format the data for the chart
    const ohlcData = data.map((item) => ({
      time: (new Date(item.date).getTime() / 1000) as UTCTimestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    const volumeData = data.map((item) => ({
      time: (new Date(item.date).getTime() / 1000) as UTCTimestamp,
      value: item.volume,
      color: item.close >= item.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    }));

    // Set the data
    mainSeries.setData(ohlcData);
    volumeSeries.setData(volumeData);

    // Fit content
    chart.timeScale().fitContent();

    // Set up resize observer for responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
      setContainerWidth(width);
      setContainerHeight(height);
    });

    resizeObserver.observe(chartContainerRef.current);
    resizeObserverRef.current = resizeObserver;
    chartRef.current = chart;

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      if (resizeObserverRef.current && chartContainerRef.current) {
        resizeObserverRef.current.unobserve(chartContainerRef.current);
        resizeObserverRef.current = null;
      }
    };
  }, [data, title, containerWidth, containerHeight]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">{title || 'Stock Chart'}</h3>
          <div className="text-sm text-gray-500">
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Chart
          </div>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default StockChart; 