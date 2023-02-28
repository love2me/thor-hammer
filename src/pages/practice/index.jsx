import React, { useEffect, useState } from 'react';
import Chart from './chart';
import {
  Form,
  Input,
  Button,
  Dialog,
  Radio,
  Space,
  Selector,
  DatePicker,
} from 'antd-mobile';
import dayjs from 'dayjs';

const now = new Date();
function Practice() {
  const [currentTime, setCurrentTime] = useState(null);
  const [chartData, setChartData] = useState([]);
  const getBnData = () => {
    setChartData();
  };

  const parseParams = () => {};

  const onFinish = (values) => {
    setCurrentTime();
  };

  const onNext = () => {
    const newData = [];
    setChartData([...chartData, newData]);
  }

  return (
    <div>
      <Form
        name="form"
        initialValues={{}}
        onFinish={onFinish}
        layout="vertical"
        footer={
          <Button block type="submit" color="primary">
            开始
          </Button>
        }
      >
        <Form.Item name="category" label="品种">
          <Selector
            options={[
              { label: 'BTC', value: 'BTCUSDT' },
              { label: 'ETH', value: 'ETHUSDT' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="starDay"
          label="开始时间"
          trigger="onConfirm"
          onClick={(e, datePickerRef) => {
            datePickerRef.current?.open();
          }}
        >
          <DatePicker max={now}>
            {(value) =>
              value ? dayjs(value).format('YYYY-MM-DD') : '请选择日期'
            }
          </DatePicker>
        </Form.Item>
        <Form.Item name="section" label="区间">
          <Selector
            options={[
              { label: '15Min', value: '15Min' },
              { label: '1H', value: '1H' },
              { label: '4H', value: '4H' }
            ]}
          />
        </Form.Item>
      </Form>
      <Chart data={chartData} />
      <Button style={{marginLeft: 16}} color="primary" size="large">Next</Button>
      <Button style={{marginLeft: 16}} color="primary" size="large">Buy</Button>
      <Button style={{marginLeft: 16}} color="primary" size="large">Sell</Button>
    </div>
  );
}

export default Practice;
