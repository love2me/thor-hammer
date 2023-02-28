import axios from 'axios';

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
    return res?.data;
  })
}