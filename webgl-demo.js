import Cube from './cube/cube.js'
import Block from './cube/block.js'
import ByLayer from './cube/byLayer.js'
import CubeCanvas from './cube/cubeCanvas.js'

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

  window.forceSelectMode = false;

  Cube.setSolver(new ByLayer());

  cubeCanvas = new CubeCanvas(cube, canvas);
  
  let state = 0;
  let turns = 0;
  setInterval(() => {
    if (!cube.isMoving()) {
      if (state === 'solving') {
        cube.setSolving(true);
        if (!cube.runSolutionStep()) {
          state = 0;
        }
      }else if (state === 'randomizing') {
        if (turns <= 0)
          state = 0;
        
        cube.setSolving(false);
        cube.runMove([rand(3), rand(3), rand(2) === 1]);
        turns --;
      }else if (state === 'forwards') {
        cube.setSolving(true);
        cube.runSolutionStep();

        state = 0;
      }else if (state === 'backwards') {
        cube.setSolving(true);
        cube.runUndoStep();

        state = 0;
      }
      cube.setEditing(state === 'editing');
    }

    cube.act();

    $('#forwards-count').text(cube.getSolutionLength());
    $('#backwards-count').text(cube.getUndoLength());
    $('#step-forwards').prop('disabled', cube.getSolutionLength() <= 0 || state !== 0);
    $('#step-backwards').prop('disabled', cube.getUndoLength() <= 0 || state !== 0);

    $('#solve').text(state === 'solving' ? 'Stop' : 'Solve');
    $('#solve').prop('disabled', (state !== 0 && state !== 'solving') || cube.getSolutionLength() <= 0);

    $('#randomize').prop('disabled', state !== 0 && state !== 'randomizing');
    $('#edit').prop('disabled', state !== 0 && state !== 'editing');
  }, 10);

  $("#step-forwards").click((e) => {
    e.preventDefault();

    if (state === 0) state = 'forwards';
  });
  $("#step-backwards").click((e) => {
    e.preventDefault();

    if (state === 0) state = 'backwards';
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

    if (state === 0)
      state = 'editing';
    else if (state === 'editing')
      state = 0;
  });
  $("#speed").val(100 - cube.getAniDone());
  $("#speed").change((e) => {
    e.preventDefault();
    let val = $("#speed").val();

    cube.setAniDone(100 - parseInt(val));
  });

  window.randomize = (t) => {
    if (state === 0) {
      state = 'randomizing';
      turns = t;
    }else if (state === 'randomizing')
      state = 0;
  };

  window.solve = () => {
    if (state === 0) {
      if (!cube.isSolvable()) {
        alert('unsolvable');
        return;
      }
      state = 'solving';
    }else if ( state === 'solving') {
      state = 0;
    }
  };
}
