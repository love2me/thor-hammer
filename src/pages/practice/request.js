import axios from 'axios';

function getUrlParams () {
  const index = window.location.href.indexOf('?');
  const query = window.location.href.slice(index);
  return new URLSearchParams(query)
}
const urlParams = getUrlParams();

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

export function getKLine (params) {
  return axios({
    method: 'get',
    url: 'https://api.binance.com/api/v3/klines',
    params
  }).then(res => {
    return parseChartData(res?.data);
  })
}


export function postFeishuTableData (records) {
  return axios({
    method: 'post',
    url: 'https://post-feu-record-feishu-open-api-pafypimqkx.cn-hangzhou.fcapp.run',
    data: {
      feishu_app_id: urlParams.get('feishu_app_id'),
      feishu_app_secret: urlParams.get('feishu_app_secret'),
      records
    }
  })
}

const kline = {
  close: 21954.98,
  high: 22147.73,
  low: 21840.13,
  open: 22141.79
}
function getKLineDirection ({ open, close}) {
  if (open >= close) {
    return 'down'
  }
  return 'up';
}

function getHammerLineDirection () {

}
function isHammerLine({ open, close, high, low }) {
  const entity = Math.abs(open - close);
  const downValue = Math.abs(low - close);
  const upValue = Math.abs(high - close);
  
}

function getIndicator(data) {
  
}
// const symbols = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'SOLUSDT', 'MATICUSDT', 'LTCUSDT', 'BNBUSDT', 'SHIBUSDT', 'CFXUSDT', 'OPUSDT', 'ADAUSDT', 'DOGEUSDT', 'FILUSDT', 'LINKUSDT', 'DOTUSDT', 'APTUSDT', 'TRXUSDT', 'FTMUSDT', 'LDOUSDT', 'AVAXUSDT', 'EOSUSDT', 'SANDUSDT', 'AGIXUSDT', 'MASKUSDT', 'GALAUSDT', 'DYDXUSDT', 'ETCUSDT', 'ATOMUSDT', 'DASHUSDT', 'NEARUSDT', 'UNIUSDT', 'APEUSDT', 'SNXUSDT', 'MANAUSDT', 'CRVUSDT', 'YFIUSDT', 'GMTUSDT', 'XMRUSDT', 'AAVEUSDT', 'WAVESUSDT'];
const symbols = ['BTCUSDT'];
let totalCnt = 0;
const datas = [];

// symbols.forEach((symbol) => {
//   getKLine({
//     symbol,
//     interval: '1h',
//     limit: 10
//   }).then((data) => {
//     datas.push({
//       symbol,
//       indicator: getIndicator(data),
//       meta: data,
//     });
//   }).finally(() => {
//     totalCnt++;
//     if (totalCnt === symbols.length) {
//       console.log(datas, 'debugger');
//     }
//   })
// });
