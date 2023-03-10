import React, { useEffect, useRef } from 'react';
import { Button } from 'antd-mobile';
import { setMarker } from './indicators/hammer-line';
import Chart from './chart';
import { getKLine } from '../../apis';

function randomCurrentTime() {
  const year = Math.floor(2020 + Math.random() * 3);
  const month = Math.floor(1 + Math.random() * 11);
  const day = Math.floor(1 + Math.random() * 29);
  return new Date(`${year}-${month}-${day} 00:00:00`).getTime();
}


export default function Test() {
  const chartRef = useRef(null);
  const handleStart = () => {
    chartRef?.current?.reset();
    getKLine({
      symbol: 'BTCUSDT',
      interval: '1h',
      startTime: randomCurrentTime(),
      limit: 500
    }).then((data) => {
      chartRef?.current?.initChart(data);
      setMarker(data, chartRef?.current?.setLineMarker);
    })
  }

  return (
    <div>
      <Button onClick={handleStart} type="primary">Start</Button>
      <Chart ref={chartRef} />
    </div>
  );
}
