import * as React from 'react';

import { Routes, Route, HashRouter } from 'react-router-dom';
import Tab from './components/tab';
import routes from './routes';

import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="wrapper">
        <Routes>
          {routes.map(({ path, element }, idx) => {
            return <Route index={idx === 0} path={path} element={element} />;
          })}
        </Routes>
      </div>
      <Tab />
    </HashRouter>
  );
}

export default App;
