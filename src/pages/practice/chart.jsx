import React, { useRef, memo } from 'react';
import { createChart } from 'lightweight-charts';
import { forwardRef } from 'react';
import { useImperativeHandle } from 'react';

function Chart({ data }, ref) {
  const chartRef = useRef(null);
  const obvChartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const lineSeriesRef = useRef(null);
  const obvLineSeriesRef = useRef(null);
  const dataRef = useRef([]);
  const obvDataRef = useRef(null);
  const markerRef = useRef([]);
  React.useEffect(() => {
    const chartOptions = {
      layout: {
        textColor: 'black',
        background: { type: 'solid', color: 'white' },
      },
      priceScale: {
        autoScale: true,
      },
      timeScale: {
        secondsVisible: false,
        timeVisible: true,
      },
    };
    const chart = createChart(
      document.getElementById('chart-container'),
      chartOptions
    );
    const obvChart = createChart(
      document.getElementById('obv-chart'),
      chartOptions
    );
    obvChartRef.current = obvChart;
    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const lineSeries = chart.addLineSeries({ color: '#2962FF', lineWidth: 1 });
    const obvLineSeries = obvChart.addLineSeries({
      color: '#2962FF',
      lineWidth: 1,
    });
    obvLineSeriesRef.current = obvLineSeries;
    candlestickSeriesRef.current = candlestickSeries;
    lineSeriesRef.current = lineSeries;
   
    const charts = [chart, obvChart];
    charts.forEach((chart) => {
      if (!chart) {
        return;
      }
      chart.timeScale().subscribeVisibleTimeRangeChange((e) => {
        charts
          .filter((c) => c !== chart)
          .forEach((c) => {
            c.timeScale().applyOptions({
              rightOffset: chart.timeScale().scrollPosition()
            });
          });
      });
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) {
          charts
            .filter((c) => c !== chart)
            .forEach((c) => {
              c.timeScale().setVisibleLogicalRange({
                from: range?.from,
                to: range?.to
              });
            });
        }
      });
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      initChart: (data) => {
        candlestickSeriesRef.current?.setData(data);
        dataRef.current = data;
        chartRef.current.timeScale().fitContent();
      },
      initLine: (data) => {
        lineSeriesRef.current.setData(data);
        // chartRef.current.timeScale().fitContent();
      },
      initObvLine: (data) => {
        obvLineSeriesRef.current.setData(data);
      },
      updateChart: (data) => {
        candlestickSeriesRef.current?.update(data);
        dataRef.current.push(data);
      },
      getCurrentItem: () => {
        return dataRef.current[dataRef.current.length - 1];
      },
      setTradeMarker: (type) => {
        const last = dataRef.current[dataRef.current.length - 1];
        if (type === 'sale') {
          markerRef.current.push({
            time: last.time,
            position: 'aboveBar',
            color: '#e91e63',
            shape: 'arrowDown',
            text: 'Sell @ ' + last.close,
          });
        } else if (type === 'buy') {
          markerRef.current.push({
            time: last.time,
            position: 'belowBar',
            color: '#2196F3',
            shape: 'arrowUp',
            text: 'Buy @ ' + last.close,
          });
        }
        candlestickSeriesRef.current?.setMarkers(markerRef.current);
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
      },
    }),
    []
  );

  return (
    <>
      <div
        id="chart-container"
        style={{
          width: '100%',
          height: '200px',
          overflowY: 'auto',
        }}
      ></div>
      <div
        id="obv-chart"
        style={{
          width: '100%',
          height: '100px',
          overflowY: 'auto',
        }}
      ></div>
    </>
  );
}

export default forwardRef(Chart);
