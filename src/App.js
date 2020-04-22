import React from 'react';
import Canvas from './components/Canvas.js';

import './App.css';
const scenes = require('./model.json');


function App() {
	const [running, setRunning] = React.useState(false);

	return (
		<div className="App">
			<Canvas scenes={{ data: [scenes], selectedIndex: 0 }} running={running} />
			<div>
				<button onClick={() => setRunning(!running)}>
					{ running ? 'Stop' : 'Run' }
				</button>
			</div>
		</div>
	);
}

export default App;
