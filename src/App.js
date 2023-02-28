import * as React from 'react';

import { Routes, Route, HashRouter } from 'react-router-dom';
import Tab from './components/tab';
import Calculator from './pages/calculator';
import Practice from './pages/practice';

import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="wrapper">
        <Routes>
          <Route path="/index" element={<Calculator/>} />
          <Route path="/practice" element={<Practice/>} />
        </Routes>
      </div>
      {/** <Tab /> */}
    </HashRouter>
  );
}

export default App;
