import React from 'react';
import { Stage, Layer } from 'react-konva';
import shortid from 'shortid';

import Rectangle from './Rectangle/Rectangle';
import RectTransformer from './Rectangle/RectTransformer';
import AnnotationImage from './AnnotationImage/AnnotationImage';
import './App.css';

class App extends React.Component {
  state = {
    rectangles: [],
    rectCount: 0,
    selectedShapeName: '',
    mouseDown: false,
    mouseDraw: false,
    newRectX: 0,
    newRectY: 0,
  };

  componentDidMount() {
    this.img.moveToBottom();
  }

  handleStageMouseDown = (event) => {
    const { rectangles } = this.state;
    // clicked on stage - clear selection or ready to generate new rectangle
    if (event.target.className === 'Image') {
      const stage = event.target.getStage();
      const mousePos = stage.getPointerPosition();
      this.setState({
        mouseDown: true,
        newRectX: mousePos.x,
        newRectY: mousePos.y,
        selectedShapeName: '',
      });
      return;
    }
    // clicked on transformer - do nothing
    const clickedOnTransformer = event.target.getParent().className === 'Transformer';
    if (clickedOnTransformer) {
      return;
    }

    // find clicked rect by its name
    const name = event.target.name();
    const rect = rectangles.find(r => r.name === name);
    if (rect) {
      this.setState({
        selectedShapeName: name,
        rectangles,
      });
    } else {
      this.setState({
        selectedShapeName: '',
      });
    }
  };

  handleRectChange = (index, newProps) => {
    const { rectangles } = this.state;
    rectangles[index] = {
      ...rectangles[index],
      ...newProps,
    };

    this.setState({ rectangles });
  };

  handleNewRectChange = (event) => {
    const {
      rectangles, rectCount, newRectX, newRectY,
    } = this.state;
    const stage = event.target.getStage();
    const mousePos = stage.getPointerPosition();
    if (!rectangles[rectCount]) {
      rectangles.push({
        x: newRectX,
        y: newRectY,
        width: mousePos.x - newRectX,
        height: mousePos - newRectY,
        name: `rect${rectCount + 1}`,
        stroke: '#00A3AA',
        key: shortid.generate(),
      });
      return this.setState({ rectangles, mouseDraw: true });
    }
    rectangles[rectCount].width = mousePos.x - newRectX;
    rectangles[rectCount].height = mousePos.y - newRectY;
    return this.setState({ rectangles });
  };

  handleStageMouseUp = () => {
    const { rectCount, mouseDraw } = this.state;
    if (mouseDraw) {
      this.setState({ rectCount: rectCount + 1, mouseDraw: false });
    }
    this.setState({ mouseDown: false });
  };

  render() {
    const {
      state: { rectangles, selectedShapeName, mouseDown },
      handleStageMouseDown,
      handleNewRectChange,
      handleRectChange,
      handleStageMouseUp,
    } = this;
    return (
      <div id="app">
        <Stage
          ref={(node) => {
            this.stage = node;
          }}
          container="app"
          width={994}
          height={640}
          onMouseDown={handleStageMouseDown}
          onTouchStart={handleStageMouseDown}
          onMouseMove={mouseDown && handleNewRectChange}
          onTouchMove={mouseDown && handleNewRectChange}
          onMouseUp={mouseDown && handleStageMouseUp}
          onTouchEnd={mouseDown && handleStageMouseUp}
        >
          <Layer>
            {rectangles.map((rect, i) => (
              <Rectangle
                sclassName="rect"
                key={rect.key}
                {...rect}
                onTransform={(newProps) => {
                  handleRectChange(i, newProps);
                }}
              />
            ))}
            <RectTransformer selectedShapeName={selectedShapeName} />
          </Layer>
          <Layer
            ref={(node) => {
              this.img = node;
            }}
          >
            <AnnotationImage />
          </Layer>
        </Stage>
      </div>
    );
  }
}

export default App;
