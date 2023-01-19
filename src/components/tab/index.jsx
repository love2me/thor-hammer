import React, { useState } from 'react';

import { TabBar } from 'antd-mobile';
import { AppOutline, UnorderedListOutline } from 'antd-mobile-icons';
import './index.css';

function Tabbar() {
  const tabs = [
    {
      key: 'calculator',
      title: '计算器',
      icon: <AppOutline />,
    },
    {
      key: 'todo',
      title: '待办',
      icon: <UnorderedListOutline />,
    },
  ];

  const [activeKey, setActiveKey] = useState('calculator');

  return (
    <TabBar
      className="tab"
      activeKey={activeKey}
      onChange={(key) => {
        setActiveKey(key);
      }}
    >
      {tabs.map((item) => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  );
}

export default Tabbar;
