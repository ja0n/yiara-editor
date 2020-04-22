import React from 'react';
import styled from 'styled-components';
import Runner from 'kurupira-runner';
import DirectorMode from '../DirectorMode';

const Container = styled.div({
  height: 400,
  width: 600,
  margin: 20,
  textAlign: 'center',
  display: 'inline-block',
});

const Preview = styled.div`
  width: 600px;
  height: 400px;
  visibility: hidden;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  position: relative;
  width: 600px;
  height: 400px;

  > * {
    position: absolute;
    top: 0;
    left: 0;
  }
`;


class Canvas extends React.Component {
  constructor () {
    super();
    this.state = { running: false };
  }

  setupCanvas(ref) {
    if (!ref)
      return null;

    const director = this.directorInstance = new DirectorMode(ref);

    //  director.runCycle();
    const scene = this.getCurrentScene();
    director.loadScene(scene);
    director.onSelect = (actor) => {
      console.log(actor);
    };

    director.onDrag = () => {
    };
  }

  setupPreview(ref) {
    this.previewRef = ref;
  }

  getCurrentScene() {
    const { scenes } = this.props;
    const { data, selectedIndex } = scenes;
    return data[selectedIndex];
  }

  preview() {
    const { running } = this.state
    const { previewRef } = this;
    const nextState = !running;

    previewRef.style.visibility = nextState ? 'unset' : 'hidden';

    if (nextState) {
      const scene = this.getCurrentScene();
      const Game = new Runner(scene, this.previewRef);
      Game.addMouseConstraint();
      Game.run();
    } else {
      previewRef.removeChild(previewRef.children[0])
    }

    this.setState({ running: nextState });
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.running !== nextProps.running)
      this.preview();
    return false;
  }

  render() {
    const { running } = this.state;
    return (
      <Container>
        <CanvasContainer running={running}>
          <canvas width="600" height="400" ref={ref => this.setupCanvas(ref)}>
            no support
          </canvas>
          <Preview ref={ref => this.setupPreview(ref)}>

          </Preview>
        </CanvasContainer>
      </Container>
    );
  }
}

export default Canvas;
