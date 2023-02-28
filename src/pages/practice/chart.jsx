import React, { useRef } from 'react';
import { createChart } from 'lightweight-charts';

function Chart({ data }) {
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  React.useEffect(() => {
    const chartOptions = { layout: { textColor: 'black', background: { type: 'solid', color: 'white' } } };
    const chart = createChart(document.getElementById('chart-container'), chartOptions);
    chartRef.current = chart;
    const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    candlestickSeriesRef.current = candlestickSeries;
  }, []);

  React.useEffect(() => {
    if (data) {
      candlestickSeriesRef.current?.setData(data);
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div id="chart-container" style={{
      width: '100%',
      height: '400px',
      overflowY: 'auto'
    }}>
    </div>
  );
}

export default Chart;
