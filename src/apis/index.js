import axios from 'axios';

function getUrlParams() {
  const index = window.location.href.indexOf('?');
  const query = window.location.href.slice(index);
  return new URLSearchParams(query);
}
export const urlParams = getUrlParams();

function parseChartData(data, symbol) {
  return data.map((kline) => {
    const time = kline[0] / 1000;
    const open = +kline[1];
    const high = +kline[2];
    const low = +kline[3];
    const close = +kline[4];
    const volume = +kline[5]
    return {
      symbol,
      time,
      open,
      high,
      low,
      close,
      volume
    };
  });
}

export function getKLine(params) {
  return axios({
    method: 'get',
    url: 'https://api.binance.com/api/v3/klines',
    params,
  }).then((res) => {
    return parseChartData(res?.data, params.symbol);
  });
}

export function postFeishuTableData({
  app_token,
  table_id,
  records
}) {
  return axios({
    method: 'post',
    url: 'https://post-feu-record-feishu-open-api-pafypimqkx.cn-hangzhou.fcapp.run',
    data: {
      feishu_app_id: urlParams.get('feishu_app_id'),
      feishu_app_secret: urlParams.get('feishu_app_secret'),
      app_token,
      table_id,
      records,
    },
  });
}
