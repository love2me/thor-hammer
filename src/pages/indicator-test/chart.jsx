import React, { useRef, memo } from 'react';
import { createChart } from 'lightweight-charts';
import { forwardRef } from 'react';
import { useImperativeHandle } from 'react';

function Chart({ data }, ref) {
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const dataRef = useRef([]);
  const markerRef = useRef([]);
  React.useEffect(() => {
    const chartOptions = { 
      layout: { 
        textColor: 'black', 
        background: { type: 'solid', color: 'white' } 
      }, 
      priceScale: {
        autoScale: true,
      },
      timeScale: {
        secondsVisible: false,
        timeVisible: true,
      },
    };
    const chart = createChart(document.getElementById('chart-container'), chartOptions);
    chartRef.current = chart;
   
    const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    candlestickSeriesRef.current = candlestickSeries;
  }, []);

  useImperativeHandle(ref, () => ({
    reset: () => {
      markerRef.current = [];
      candlestickSeriesRef.current?.setMarkers(markerRef.current);
    },
    initChart: (data) => {
      candlestickSeriesRef.current?.setData(data);
      dataRef.current = data;
      chartRef.current.timeScale().fitContent();
    },
    getCurrentItem: () => {
      return dataRef.current[dataRef.current.length - 1]
    },
    setLineMarker: ({ time, text }) => {
      markerRef.current.push({
        time,
        position: 'belowBar',
        color: '#2196F3',
        shape: 'arrowUp',
        text,
      });
      candlestickSeriesRef.current?.setMarkers(markerRef.current);
    }
  }), [])

  return (
    <div id="chart-container" style={{
      width: '100%',
      height: '400px',
      overflowY: 'auto'
    }}>
    </div>
  );
}

export default forwardRef(Chart);
