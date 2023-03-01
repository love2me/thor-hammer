import axios from 'axios';

function parseChartData (data) {
  return data.map((kline) => {
    const time = kline[0] / 1000; 
    const open = +kline[1];
    const high = +kline[2];
    const low = +kline[3];
    const close = +kline[4];
    return {
      time,
      open,
      high,
      low,
      close
    }
  })
}

export function getKLine () {
  return axios({
    method: 'get',
    url: 'https://api.binance.com/api/v3/klines',
    params: {
      symbol: 'BTCUSDT',
      interval: '1h',
      startTime: 1677427200000,
      endTime: 1677513600000
    }
  }).then(res => {
    return parseChartData(res?.data);
  })
}