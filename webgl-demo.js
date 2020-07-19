import Cube from './cube/cube.js'
import Block from './cube/block.js'
import ByLayer from './cube/byLayer.js'
import CubeCanvas from './cube/cubeCanvas.js'

var cubeRotation = 0.0;

var glWindow;
var cube;
var cubeCanvas;

function rand(max) {
  return Math.floor(Math.random() * max);
}

main();

function main() {
  const canvas = document.querySelector('#glcanvas');

  cube = new Cube();

  window.Cube = Cube;
  window.Block = Block;
  window.cube = cube;

  Cube.setSolver(new ByLayer());

  cubeCanvas = new CubeCanvas(cube, canvas);
  
  setInterval(() => {
    cube.act();

    if (cube.isSolving() && cube.isSolved()) {
      cube.setSolving(false);
    }
  }, 10);

  $("#step-forwards").click((e) => {
    e.preventDefault();

    cube.setSolving(true);
    cube.runSolutionStep();
  });
  $("#step-backwards").click((e) => {
    e.preventDefault();

    cube.setSolving(true);
    cube.runUndoStep();
  });
  $("#solve").click((e) => {
    e.preventDefault();

    window.solve();
  });
  $("#randomize").click((e) => {
    e.preventDefault();

    window.randomize(50);
  });
  $("#edit").click((e) => {
    e.preventDefault();

    cube.setEditing(!cube.isEditing());
  });
  $("#speed").val(100 - cube.getAniDone());
  $("#speed").change((e) => {
    e.preventDefault();
    let val = $("#speed").val();

    cube.setAniDone(100 - parseInt(val));
  });

  window.randomize = (turns) => {
    
    let pointer = setInterval(() => {
      if (!cube.isMoving()) {
        if (turns <= 0 || cube.isSolving()) {
          clearInterval(pointer);
          return;
        }
        cube.runMove([rand(3), rand(3), rand(2) === 1]);

        turns --;
      }
    }, 10);
  };

  window.solve = () => {
    if (!cube.isSolvable()) {
      alert('unsolvable');
      return;
    }
    cube.setSolving(true);
    let pointer = setInterval(() => {
      if (!cube.isMoving()) {
        if (cube.isSolved()) {
          cube.setSolving(false);
          clearInterval(pointer);
          return;
        }
        cube.runSolutionStep();
      }
    }, 10);
  };
}
