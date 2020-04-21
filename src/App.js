import React from 'react';
import Canvas from './components/Canvas.js';

import './App.css';
const scenes = require('./model.json');


function App() {
  return (
    <div className="App">
      <Canvas scenes={{ data: [scenes], selectedIndex: 0 }} />
    </div>
  );
}

export default App;
