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

function getKLineDirection ({ open, close }) {
  if (open >= close) {
    return 'down'
  }
  return 'up';
}

function parseLineBaseInfo ({ open, close, high, low }) {
  const direction = getKLineDirection({ open, close });
  // 实体
  const entity = open - close;
  let upShadowLine = null;
  let downShadowLine = null;
  if (direction === 'up') {
    // 上影线
    upShadowLine = high - close;
    // 下影线
    downShadowLine = open - low;
  } else if (direction === 'down') {
    // 上影线
    upShadowLine = high - open;
    // 下影线
    downShadowLine = close - low;
  }
  return {
    direction,
    entity: Math.abs(entity),
    upShadowLine: Math.abs(upShadowLine),
    downShadowLine: Math.abs(downShadowLine),
  }
}
/**
 * 检查是否为锤子线
 * @param param0 
 * @returns 
 */
function checkHammerLine({ open, close, high, low }) {
  const { entity, upShadowLine, downShadowLine } = parseLineBaseInfo({ open, close, high, low })

  const upShadowLineTimes = upShadowLine / entity;
  const downShadowLineTimes = downShadowLine / entity;

  // 上涨锤子线
  let isUpHammmerLine = downShadowLineTimes > 3 && upShadowLineTimes < 0.617;
  // 下跌上影线
  let isDownHammmerLine = upShadowLineTimes > 3 && downShadowLineTimes < 0.617;
  
  let direction = null;
  if (isUpHammmerLine) {
    direction = 'up';
  } else if (isDownHammmerLine) {
    direction = 'down';
  }
  return {
    direction,
    is: isUpHammmerLine || isDownHammmerLine,
  }
}
/**
 * 检查是否为实体线
 * @param {*} data 
 */
function checkEntityLine({ open, close, high, low }) {
  const { direction, entity, upShadowLine, downShadowLine } = parseLineBaseInfo({ open, close, high, low });
  // 实体长度要大于上影线 + 下影线两倍以上
  const is = (entity / (upShadowLine + downShadowLine)) > 2;
  return {
    direction,
    is
  }
}

function checkHammerIndicator(data) {
  const [one, two] = data.slice(-2);
  const hammerLine = checkHammerLine(one);
  const entityLine = checkEntityLine(two);
  return {
    is: hammerLine.is && entityLine.is && hammerLine.direction === entityLine.direction,
    direction: hammerLine.direction
  }
}

export function getIndicator(data) {
  const { is: isHammerLine, direction: hammerLineDirection} = checkHammerIndicator(data);
  return {
    isHammerLine,
    hammerLineDirection
  }
}

function getSymbolsData () {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'SOLUSDT', 'MATICUSDT', 'LTCUSDT', 'BNBUSDT', 'SHIBUSDT', 'CFXUSDT', 'OPUSDT', 'ADAUSDT', 'DOGEUSDT', 'FILUSDT', 'LINKUSDT', 'DOTUSDT', 'APTUSDT', 'TRXUSDT', 'FTMUSDT', 'LDOUSDT', 'AVAXUSDT', 'EOSUSDT', 'SANDUSDT', 'AGIXUSDT', 'MASKUSDT', 'GALAUSDT', 'DYDXUSDT', 'ETCUSDT', 'ATOMUSDT', 'DASHUSDT', 'NEARUSDT', 'UNIUSDT', 'APEUSDT', 'SNXUSDT', 'MANAUSDT', 'CRVUSDT', 'YFIUSDT', 'GMTUSDT', 'XMRUSDT', 'AAVEUSDT', 'WAVESUSDT'];
  let totalCnt = 0;
  const datas = [];
  return new Promise((resolve, reject) => {
    symbols.forEach((symbol) => {
      getKLine({
        symbol,
        interval: '1h',
        limit: 2
      }).then((data) => {
        datas.push({
          symbol,
          indicator: getIndicator(data),
          meta: data,
        });
      }).finally(() => {
        totalCnt++;
        if (totalCnt === symbols.length) {
          resolve(datas);
        }
      })
    });
  })
}
