import React, { useEffect, useState } from 'react';
import Chart from './chart';
import { Form, Button, Selector } from 'antd-mobile';
import dayjs from 'dayjs';
import { getKLine } from './request';
import { useRef } from 'react';

const now = new Date();

const intervalTimeMapping = {
  '15min': 900,
  '1h': 3600,
  '4h': 14400,
};

function randomCurrentTime() {}

function Practice() {
  const [values, setValues] = useState({});
  const [currentTime, setCurrentTime] = useState(null);
  const [tradingPosition, setTradingPosition] = useState(null);
  const [tradeRecords, setTradeRecords] = useState([]);
  const storageDataRef = useRef([]);
  const chartRef = useRef(null);

  const getPreOrNextTime = (time, type) => {
    const { interval } = values;
    const intervalTime = intervalTimeMapping[interval];
    const count = 100;
    if (type === 'pre') {
      return time - intervalTime * count;
    }
    if (type === 'next') {
      return time + intervalTime * count;
    }
  };

  const getKLineData = ({ type, currentTime, interval, symbol }) => {
    const startTime = null;
    const endTime = null;
    if (type === 'pre') {
      startTime = getPreOrNextTime(currentTime, 'pre');
      endTime = currentTime;
    }
    if (type === 'next') {
      startTime = currentTime;
      endTime = getPreOrNextTime(currentTime, 'next');
    }
    return getKLine({
      symbol,
      startTime,
      endTime,
      interval,
    });
  };

  const getNextData = () => {
    getKLineData({
      ...values,
      type: 'next',
      currentTime,
    }).then((data) => {
      storageDataRef.current = data;
    });
  };

  const onFinish = (values) => {
    const currentTime = 0;
    setValues(values);
    setCurrentTime(currentTime);
    getKLineData({
      ...values,
      type: 'pre',
      currentTime,
    }).then((data) => {
      chartRef?.current?.initChart(data);
      getNextData();
    });
  };

  const updateNextData = () => {
    const time = intervalTimeMapping[values[interval]];
    chartRef?.current?.update(storageDataRef.current.shift());
    setCurrentTime(currentTime + time);
  };

  const onNext = () => {
    if (storageDataRef.current?.length > 0) {
      updateNextData();
    } else {
      getNextData().then(() => {
        updateNextData();
      });
    }
  };

  const onBuy = () => {
    if (!tradingPosition) {
      // 开多
      setTradingPosition({
        direction: 'long',
        startPrice: currentPrice,
      });
    } else {
      // 平空
      if (tradingPosition.direction === 'short') {
        setTradeRecords([
          ...tradeRecords,
          {
            ...tradingPosition,
            endPrice: currentPrice,
          },
        ]);
      }
    }
  };

  const onSale = () => {
    if (!tradingPosition) {
      // 开空
      setTradingPosition({
        direction: 'short',
        startPrice: currentPrice,
      });
    } else {
      // 平多
      if (tradingPosition.direction === 'long') {
        setTradeRecords([
          ...tradeRecords,
          {
            ...tradingPosition,
            endPrice: currentPrice,
          },
        ]);
      }
    }
  };

  return (
    <div>
      <Form
        name="form"
        initialValues={{}}
        onFinish={onFinish}
        layout="vertical"
        footer={
          <Button block type="submit" color="primary">
            Start
          </Button>
        }
      >
        <Form.Item name="symbol" label="Symbol">
          <Selector
            options={[
              { label: 'BTC', value: 'BTCUSDT' },
              { label: 'ETH', value: 'ETHUSDT' },
            ]}
          />
        </Form.Item>
        <Form.Item name="interval" label="Interval">
          <Selector
            options={[
              { label: '15min', value: '15min' },
              { label: '1h', value: '1h' },
              { label: '4h', value: '4h' },
            ]}
          />
        </Form.Item>
      </Form>
      <Chart ref={chartRef} data={chartData} />
      <Button
        style={{ marginLeft: 16 }}
        color="primary"
        size="large"
        onClick={onNext}
      >
        Next
      </Button>
      <Button
        style={{ marginLeft: 16 }}
        color="primary"
        size="large"
        onClick={onBuy}
      >
        Buy
      </Button>
      <Button
        style={{ marginLeft: 16 }}
        color="primary"
        size="large"
        onClick={onSale}
      >
        Sell
      </Button>

      <H1>TradeRecord</H1>
      <div>
        {tradeRecords.map((record) => {
          return (
            <div>
              <div>方向：{record.direction}</div>
              <div>startPrice：{record.startPrice}</div>
              <div>endPrice：{record.endPrice}</div>
              <div>rate：{record.direction}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Practice;
