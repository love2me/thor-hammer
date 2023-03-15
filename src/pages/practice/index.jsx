import React, { useEffect, useState } from 'react';
import Chart from './chart';
import { Form, Button, Selector, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { getKLine, postFeishuTableData } from '../../apis';
import { useRef } from 'react';
import { EMA, OBV } from 'bfx-hf-indicators'; 


const now = new Date();
const ema = new EMA([10]);
const obv = new OBV([10]);

const intervalTimeMapping = {
  '15min': 900000,
  '1h': 3600000,
  '4h': 14400000,
  '1d': 86400000
};

function randomCurrentTime() {
  const year = Math.floor(2020 + Math.random() * 3);
  const month = Math.floor(1 + Math.random() * 11);
  const day = Math.floor(1 + Math.random() * 29);
  return dayjs(`${year}-${month}-${day} 00:00:00`).valueOf();
}

function calc(direction, startPrice, endPrice) {
  const rate = Math.abs(
    (((endPrice - startPrice) / startPrice) * 100).toFixed(2)
  );
  if (direction === 'long') {
    if (startPrice > endPrice) {
      return -rate;
    } else {
      return rate;
    }
  } else if (direction === 'short') {
    if (startPrice < endPrice) {
      return -rate;
    } else {
      return rate;
    }
  }
}

function parseFeishuRecord(records, symbol) {
  return records.map((item) => ({
    fields: {
      品种: symbol,
      开仓时间: item.startTime * 1000,
      平仓时间: item.endTime * 1000,
      开仓价: item.startPrice,
      平仓价: item.endPrice,
      收益率: item.rate,
    },
  }));
}

function Practice() {
  const [values, setValues] = useState({});
  const [currentTime, setCurrentTime] = useState(null);
  const [tradingPosition, setTradingPosition] = useState(null);
  const [tradeRecords, setTradeRecords] = useState([]);
  const storageDataRef = useRef([]);
  const chartRef = useRef(null);

  const getPreOrNextTime = (time, interval, type) => {
    const intervalTime = intervalTimeMapping[interval];
    const count = 200;
    if (type === 'pre') {
      return time - intervalTime * count;
    }
    if (type === 'next') {
      return time + intervalTime * count;
    }
  };

  const getKLineData = ({ type, currentTime, interval, symbol }) => {
    let startTime = null;
    let endTime = null;
    if (type === 'pre') {
      startTime = getPreOrNextTime(currentTime, interval, 'pre');
      endTime = currentTime - 1;
    }
    if (type === 'next') {
      startTime = currentTime;
      endTime = getPreOrNextTime(currentTime, interval, 'next') - 1;
    }
    return getKLine({
      symbol,
      startTime,
      endTime,
      interval,
    });
  };

  const getNextData = (values) => {
    return getKLineData({
      ...values,
      type: 'next',
    }).then((data) => {
      storageDataRef.current = data;
    });
  };

  const onFinish = (values) => {
    const currentTime = randomCurrentTime();
    const { symbol, interval } = values;
    const newValues = {
      symbol: symbol[0],
      interval: interval[0],
    };
    setValues(newValues);
    setCurrentTime(currentTime);
    getKLineData({
      symbol: symbol[0],
      interval: interval[0],
      type: 'pre',
      currentTime,
    }).then((data) => {
      chartRef?.current?.initChart(data);
      const middles = data.map((item) => {
        const middle = ((item.high + item.low) / 2).toFixed(2);
        ema.add(middle)
        return middle;
      });
      const lineData = data.slice(13).map((item, idx) => {
        return {
          ...item,
          value: ema._values[idx]
        }
      })
      const obvData = data.map((item) => {
        obv.add(item);
        return {
          time: item.time,
          value: obv.v() || 0
        }
      });
      chartRef?.current?.initChart(data);
      console.log(data, obvData, 'debugger');
      chartRef?.current?.initLine(lineData);
      chartRef?.current?.initObvLine(obvData)
    });
    getNextData({ ...newValues, currentTime });
  };

  const updateNextData = () => {
    const { interval } = values;
    const time = intervalTimeMapping[interval];
    const item = storageDataRef.current.shift();
    chartRef?.current?.updateChart(item);
    setCurrentTime(currentTime + time);
  };

  const onNext = () => {
    if (storageDataRef.current?.length > 0) {
      updateNextData();
    } else {
      getNextData({
        ...values,
        currentTime,
      }).then(() => {
        updateNextData();
      });
    }
  };

  const onBuy = () => {
    const { close: currentPrice, time: currentTime } =
      chartRef.current.getCurrentItem();
    if (!tradingPosition) {
      // 开多
      setTradingPosition({
        direction: 'long',
        startPrice: currentPrice,
        startTime: currentTime,
      });
    } else {
      // 平空
      if (tradingPosition.direction === 'short') {
        setTradeRecords([
          ...tradeRecords,
          {
            ...tradingPosition,
            endPrice: currentPrice,
            endTime: currentTime,
            rate: calc(
              tradingPosition.direction,
              tradingPosition.startPrice,
              currentPrice
            ),
          },
        ]);
        setTradingPosition(null);
      }
    }
    chartRef.current.setTradeMarker('buy');
  };

  const onSale = () => {
    const { close: currentPrice, time: currentTime } =
      chartRef.current.getCurrentItem();
    if (!tradingPosition) {
      // 开空
      setTradingPosition({
        direction: 'short',
        startPrice: currentPrice,
        startTime: currentTime,
      });
    } else {
      // 平多
      if (tradingPosition.direction === 'long') {
        setTradeRecords([
          ...tradeRecords,
          {
            ...tradingPosition,
            endPrice: currentPrice,
            endTime: currentTime,
            rate: calc(
              tradingPosition.direction,
              tradingPosition.startPrice,
              currentPrice
            ),
          },
        ]);
        setTradingPosition(null);
      }
    }
    chartRef.current.setTradeMarker('sale');
  };

  const sendRecordToFeishu = () => {
    postFeishuTableData(parseFeishuRecord(tradeRecords, values.symbol)).then(
      () => {
        Toast.show('发送成功');
      }
    );
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
              { label: 'BNB', value: 'BNBUSDT' },
              { label: 'XRP', value: 'XRPUSDT' },
              { label: 'ADA', value: 'ADAUSDT' },
              { label: 'SOL', value: 'SOLUSDT' },
              { label: 'LTC', value: 'LTCUSDT' },
              { label: 'MATIC', value: 'MATICUSDT' },
            ]}
          />
        </Form.Item>
        <Form.Item name="interval" label="Interval">
          <Selector
            options={[
              { label: '15min', value: '15m' },
              { label: '1h', value: '1h' },
              { label: '4h', value: '4h' },
              { label: '1d', value: '1d' },
            ]}
          />
        </Form.Item>
      </Form>
      <Chart ref={chartRef} />
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
        Sale
      </Button>
      <h1>TradeRecord</h1>
      {tradingPosition && (<div>
        tradingPosition: {JSON.stringify(tradingPosition)}
      </div>)}
      <div>
        <div>
          total rate：{tradeRecords.reduce((total, item) => total + item.rate, 0).toFixed(2)}%
        </div>
        {tradeRecords.map((record) => {
          return (
            <div
              style={{ display: 'flex', flexDirection: 'row', fontSize: 16 }}
            >
              <div>direction：{record.direction}</div> |
              <div>startPrice：{record.startPrice}</div> |
              <div>endPrice：{record.endPrice}</div> |
              <div>rate：{record.rate}%</div>
            </div>
          );
        })}
      </div>
      <Button
        onClick={() => {
          alert(JSON.stringify(tradeRecords));
        }}
      >
        getRecordsJSON
      </Button>
      <Button onClick={sendRecordToFeishu}>sendRecordToFeishu</Button>
    </div>
  );
}

export default Practice;
