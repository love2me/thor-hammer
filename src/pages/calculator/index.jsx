import React from 'react';
import {
  Form,
  Input,
  Button,
  Dialog,
  Radio,
  Space,
} from 'antd-mobile';

const total = 400;

function calcAmount (ratio) {
  return parseInt(total * (ratio / 100))
}
const steps = [
  {
    ratio: 2.5,
    amount: calcAmount(2.5),
    desc: '15Min'
  },
  {
    ratio: 5,
    amount: calcAmount(5),
    desc: '1H'
  },
  {
    ratio: 7.5,
    amount: calcAmount(7.5),
    desc: '4H'
  },
  {
    ratio: 10,
    amount: calcAmount(10),
    desc: '1D'
  },
  {
    ratio: 12.5,
    amount: calcAmount(12.5),
    desc: '1-4-1'
  }
]

function Calculator() {
  const onFinish = (values) => {
    const { direction, startPrice, stoplessPrice, ratio } = values;
    console.log(values,'debugger');
    const amount = steps.find((step) => step.ratio === ratio).amount;
    console.log(amount);
    const res = parseInt(Math.abs(amount / ((+startPrice - +stoplessPrice) / +startPrice)));
    Dialog.alert({
      content: res,
      onConfirm: () => {
        console.log('')
      }
    })
  };

  return (
    <Form
      name="form"
      initialValues={{
        direction: 'long',
        ratio: steps[0].ratio
      }}
      onFinish={onFinish}
      footer={
        <Button block type="submit" color="primary" size="large">
          计算
        </Button>
      }
    >
      <Form.Header>计算器</Form.Header>
      <Form.Item name="direction" label="方向">
        <Radio.Group>
          <Space direction="horizontal" block>
            <Radio value="long">多</Radio>
            <Radio value="short">空</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
      <Form.Item name="startPrice" label="开仓价" rules={[{ required: true }]}>
        <Input type="number" />
      </Form.Item>
      <Form.Item name="stoplessPrice" label="止损价" rules={[{ required: true }]}>
        <Input type="number" />
      </Form.Item>
      <Form.Item name="ratio" label="止损比例" rules={[{ required: true }]}>
        <Radio.Group>
          总金额：${total}
          <Space direction="vertical" block>
            {
              steps.map((step) => {
               return <Radio value={step.ratio}>{step.ratio}%、{step.desc}（${step.amount}）</Radio>
              })
            }
          </Space>
        </Radio.Group>
      </Form.Item>
    </Form>
  );
}

export default Calculator;
