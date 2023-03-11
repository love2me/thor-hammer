import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Button, Toast } from 'antd-mobile';
import { setMarker, backTest } from './indicators/hammer-line';
import Chart from './chart';
import { getKLine, postFeishuTableData, urlParams } from '../../apis';

function randomCurrentTime() {
  const year = Math.floor(2019 + Math.random() * 3);
  const month = Math.floor(1 + Math.random() * 11);
  const day = Math.floor(1 + Math.random() * 29);
  const hour = Math.floor(Math.random() * 23)
  return new Date(`${year}-${month}-${day} ${hour}:00:00`).getTime();
}

const backTestRecordCache = {};

export default function Test() {
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
  const [backTestRecords, setBackTestRecords] = useState([]);
  const handleChartTest = () => {
    chartRef?.current?.reset();
    setLoading(true);
    getKLine({
      symbol: 'BTCUSDT',
      interval: (urlParams.get('interval') || '1h'),
      startTime: randomCurrentTime(),
      limit: 500,
    })
      .then((data) => {
        chartRef?.current?.initChart(data);
        setMarker(data, chartRef?.current?.setLineMarker);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const runBackTest = ({
    isShowChart = true,
    symbol = 'BTCUSDT',
    interval = (urlParams.get('interval') || '1h'),
  }) => {
    if (isShowChart) {
      chartRef?.current?.reset();
    }
    return getKLine({
      symbol,
      interval,
      startTime: randomCurrentTime(),
      limit: 500,
    }).then((data) => {
      if (isShowChart) {
        chartRef?.current?.initChart(data);
        setMarker(data, chartRef?.current?.setLineMarker);
      }
      const backTestRes = backTest(data);
      const filteredRes = backTestRes.filter((res) => {
        const key = `${symbol}/${res.time}`;
        // 没缓存就添加到记录里
        if (!backTestRecordCache[key]) {
          backTestRecordCache[key] = true;
          return true;
        }
        return false;
      });
      return filteredRes;
    });
  };

  const handleBackTest = () => {
    setLoading(true);
    runBackTest({
      isShowChart: true,
    })
      .then((res) => {
        setBackTestRecords([...res, ...backTestRecords]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSingleSymbolBackTest100 = () => {
    setLoading(true);
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(
        runBackTest({
          isShowChart: false,
        })
      );
    }
    Promise.all(promises)
      .then((allRes) => {
        const arr = allRes.reduce((total, res) => {
          return total.concat(res);
        }, []);
        setBackTestRecords([...arr, ...backTestRecords]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleMultipleSymbolBackTest = () => {
    setLoading(true);
    const promises = [];
    const symbols = [
      'BTCUSDT',
      'ETHUSDT',
      'XRPUSDT',
      'SOLUSDT',
      'MATICUSDT',
      'LTCUSDT',
      'BNBUSDT',
      'SHIBUSDT',
      'CFXUSDT',
      'OPUSDT',
      'ADAUSDT',
      'DOGEUSDT',
      'FILUSDT',
      'LINKUSDT',
      'DOTUSDT',
      'APTUSDT',
      'TRXUSDT',
      'FTMUSDT',
      'LDOUSDT',
      'AVAXUSDT',
      'EOSUSDT',
      'SANDUSDT',
      'AGIXUSDT',
      'MASKUSDT',
      'GALAUSDT',
      'DYDXUSDT',
      'ETCUSDT',
      'ATOMUSDT',
      'DASHUSDT',
      'NEARUSDT',
      'UNIUSDT',
      'APEUSDT',
      'SNXUSDT',
      'MANAUSDT',
      'CRVUSDT',
      'YFIUSDT',
      'GMTUSDT',
      'XMRUSDT',
      'AAVEUSDT',
      'WAVESUSDT',
      'SUSHIUSDT',
      'JASMYUSDT',
      'ANKRUSDT',
      'FLOWUSDT',
      'BCHUSDT',
      'RENUSDT',
      'ENSUSDT',
      'ZILUSDT',
      'LRCUSDT',
      'SKLUSDT',
      'THETAUSDT',
      'XLMUSDT',
      'ONEUSDT',
      'ENJUSDT',
      'ZENUSDT',
      'AUDIOUSDT',
      'XTZUSDT',
      'COMPUSDT',
      'CAKEUSDT',
      'IOTXUSDT',
      'UNFIUSDT',
      'LITUSDT',
      'KNCUSDT',
      'DARUSDT',
      'ONTUSDT',
    ];
    for (let i = 0; i < symbols.length; i++) {
      promises.push(
        runBackTest({
          isShowChart: false,
          symbol: symbols[i],
        })
      );
    }
    Promise.all(promises)
      .then((allRes) => {
        const arr = allRes.reduce((total, res) => {
          return total.concat(res);
        }, []);
        setBackTestRecords([...arr, ...backTestRecords]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const { profitCount, lossCount } = useMemo(() => {
    let profitCount = 0;
    let lossCount = 0;
    backTestRecords.forEach((record) => {
      if (record.isProfit) {
        profitCount++;
      } else {
        lossCount++;
      }
    });
    return {
      profitCount,
      lossCount,
    };
  }, [backTestRecords]);

  const sendRecordToFeishu = () => {
    setLoading(true);
    postFeishuTableData({
      app_token: urlParams.get('app_token'),
      table_id: urlParams.get('table_id'),
      records: backTestRecords.map(({ symbol, time, startPrice, endPrice, isProfit, profitRate }) => {
        return {
          fields: {
            '品种': symbol,
            '开仓时间': time,
            '开仓价': startPrice,
            '平仓价': endPrice,
            '收益率': +profitRate,
            '是否盈利': isProfit ? '是' : '否'
          }
        }
      })
    }).then(() => {
      Toast.show('发送成功')
    }).finally(() => {
      setLoading(false);
    })
  }

  return (
    <div>
      <div style={{ margin: '16px 0' }}>
        <Button
          loading={loading}
          style={{ marginRight: 16 }}
          onClick={handleChartTest}
          color="primary"
        >
          ChartTest
        </Button>
        <Button
          loading={loading}
          style={{ marginRight: 16 }}
          onClick={handleBackTest}
          color="primary"
        >
          SingleSymbolBackTest
        </Button>
        <Button
          loading={loading}
          style={{ marginRight: 16 }}
          onClick={handleSingleSymbolBackTest100}
          color="primary"
        >
          SingleSymbolBackTest100
        </Button>
        <Button
          loading={loading}
          style={{ marginRight: 16 }}
          onClick={handleMultipleSymbolBackTest}
          color="primary"
        >
          MultipleSymbolBackTest
        </Button>
      </div>
      <Chart ref={chartRef} />
      <Button onClick={sendRecordToFeishu} color="success" loading={loading}>sendRecordToFeishu</Button>
      {backTestRecords?.length > 0 && (
        <div>
          <div>
            <div>
              胜率：{(profitCount / (profitCount + lossCount)).toFixed(2)}
            </div>
            <div>盈利次数：{profitCount}</div>
            <div>亏损次数：{lossCount}</div>
          </div>
          {backTestRecords.map((record, idx) => {
            return (
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div>{idx}</div>
                <div style={{marginRight: 8}}>品种：{record.symbol}</div>
                <div style={{marginRight: 8}}>开仓时间：{record.time}</div>
                <div style={{marginRight: 8}}>开仓价：{record.startPrice}</div>
                <div style={{marginRight: 8}}>平仓价：{record.endPrice}</div>
                <div style={{marginRight: 8}}>是否盈利：{record.isProfit}</div>
                <div style={{marginRight: 8}}>收益率：{record.profitRate}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
