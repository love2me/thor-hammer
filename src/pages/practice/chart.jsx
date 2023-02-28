import React, { useRef, memo } from 'react';
import { createChart } from 'lightweight-charts';
import { forwardRef } from 'react';
import { useImperativeHandle } from 'react';

function Chart({ data }, ref) {
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
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
    initChart: (data) => {
      console.log(data,'debugger');
      candlestickSeriesRef.current?.setData(data);
      chartRef.current.timeScale().fitContent();
    },
    updateChart: () => {

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
