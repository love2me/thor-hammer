import React, { useState } from 'react';
import { Link } from "react-router-dom";

import { TabBar } from 'antd-mobile';
import { AppOutline, UnorderedListOutline } from 'antd-mobile-icons';
import './index.css';

function Tabbar() {
  const tabs = [
    {
      key: '/index',
      title: '计算器',
      icon: <AppOutline />,
    },
    {
      key: '/practice',
      title: '练习',
      icon: <UnorderedListOutline />,
    },
  ];

  const [activeKey, setActiveKey] = useState('/index');

  return (
    <TabBar
      className="tab"
      activeKey={activeKey}
      onChange={(key) => {
        setActiveKey(key);
      }}
    >
      {tabs.map((item) => (
        <TabBar.Item key={item.key} icon={item.icon}><Link to={item.key}>{item.title}</Link></TabBar.Item>
      ))}
    </TabBar>
  );
}

export default Tabbar;
