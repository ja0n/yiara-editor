import React from 'react';
import DirectorMode from '../DirectorMode';

const style = {
  height: 400,
  width: 600,
  margin: 20,
  textAlign: 'center',
  display: 'inline-block',
};

class Canvas extends React.Component {
  setupRef(ref) {
    const director = this.directorInstance = new DirectorMode(ref);
    const { scenes } = this.props;
    const data = scenes.data[scenes.selectedIndex];

    director.runGame = function() {
      localStorage.setItem('stage', JSON.stringify(data));
      window.open('/runner.html', '_blank', 'height=650,width=850');
    };

    //  director.runCycle();

    director.loadScene(data);
    director.onSelect = (actor) => {
      console.log(actor);
    };

    director.onDrag = () => {
    };
  }

  render() {
    return (
      <div style={style}>
        <canvas width="600" height="400" ref={ref => this.setupRef(ref)}>
          no support
        </canvas>

        <button onClick={() => this.directorInstance.runGame()}>
          Run
        </button>
      </div>
    );
  }
}

export default Canvas;
