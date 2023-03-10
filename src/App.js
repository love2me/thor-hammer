import * as React from 'react';

import { Routes, Route, HashRouter } from 'react-router-dom';
import Calculator from './pages/calculator';
import Practice from './pages/practice';
import Test from './pages/indicator-test';

import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="wrapper">
        <Routes>
          <Route path="/index" element={<Calculator/>} />
          <Route path="/practice" element={<Practice/>} />
          <Route path="/test" element={<Test/>} />
        </Routes>
      </div>
      {/** <Tab /> */}
    </HashRouter>
  );
}

export default App;
