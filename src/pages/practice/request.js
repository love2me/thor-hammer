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

export function getFeishuTenatToken () {
  return axios({
    method: 'post',
    url: 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    data: {
      app_id: urlParams.get('feishu_app_id'),
      app_secret: urlParams.get('feishu_app_secret')
    }
  }).then((res) => {
    return res?.data?.tenant_access_token
  });
}

export function postFeishuTableData (data) {
  return getFeishuTenatToken().then((token) => {
    axios({
      method: 'post',
      url: 'https://open.feishu.cn/open-apis/bitable/v1/apps/bascnA92KPOsGmWsXTpMfRPmAzf/tables/tblSvcvIgvEMT57k/records/batch_create',
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        records: [{
          fields: {
  
          }
        }]
      }
    })
  }) 
}