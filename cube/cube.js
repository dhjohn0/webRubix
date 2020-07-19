import Block from './block.js'

export default class Cube {
  static BLOCK_COUNT = 26

  static COL_LFT = 0
  static COL_MID = 1
  static COL_RGT = 2

  static ROW_BTM = 0
  static ROW_MID = 1
  static ROW_TOP = 2

  static FCE_BCK = 0
  static FCE_MID = 1
  static FCE_FNT = 2

  static MOVE_COL   = 0
  static MOVE_ROW   = 1
  static MOVE_FCE   = 2
  static MOVE_ROT_X = 3
  static MOVE_ROT_Y = 4
  static MOVE_ROT_Z = 5

  static solver = null;

  static setSolver(solver) { this.solver = solver; }

  constructor(cube) {
    this.blocks = [];

    for (let x = 0; x < 3; x ++) {
      for (let y = 0; y < 3; y ++) {
        for (let z = 0; z < 3; z ++) {
          if (x != 1 || y != 1 || z != 1) {
            if (cube)
              this.blocks.push(new Block(cube.getBlock(x, y, z)))
            else
              this.blocks.push(new Block(x, y, z));
          }
        }
      }
    }

    this.solvable = true;
    this.solving = false;
    this.aniDone = 25;

    this.moves = [];
    this.solution = [];
    this.undo = [];

    this.colRotIndex = 0;
    this.rowRotIndex = 0;
    this.faceRotIndex = 0;
    this.cubeXRot = 0;
    this.cubeYRot = 0;
    this.cubeZRot = 0;
    this.blockXRotIndex = 0;
    this.blockYRotIndex = 0;
    this.blockZRotIndex = 0;
    this.editOn = 0;
    this.aniCount = -1;
  }

  getBlock(col, row, face) {
    if (typeof(row) === 'undefined' && typeof(face) === 'undefined')
      return this.blocks[col];
    return this.blocks.find((b) => 
      b.getX() === col && b.getY() === row && b.getZ() === face
    );
  }

  getBlockIndex(block) {
    return this.blocks.indexOf(block);
  }

  getLog() { return this.moves; }
  getSolutionLength() { return this.solution.length; }
  getUndoLength() { return this.undo.length; }
  getAniDone() { return this.aniDone; }
  isSolvable() { return this.solvable; }

  isMoving() { return this.aniCount >= 0; }
  isSolving() { return this.solving; }

  isSolved() {
    let centers = [
      this.getBlock(Cube.COL_MID, Cube.ROW_MID, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT),
      this.getBlock(Cube.COL_RGT, Cube.ROW_MID, Cube.FCE_MID).getColorIndex(Block.FACE_RIGHT),
      this.getBlock(Cube.COL_MID, Cube.ROW_MID, Cube.FCE_BCK).getColorIndex(Block.FACE_BACK),
      this.getBlock(Cube.COL_LFT, Cube.ROW_MID, Cube.FCE_MID).getColorIndex(Block.FACE_LEFT),
      this.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_MID).getColorIndex(Block.FACE_TOP),
      this.getBlock(Cube.COL_MID, Cube.ROW_BTM, Cube.FCE_MID).getColorIndex(Block.FACE_BOTTOM)
    ]

    for (let x = 0; x < 3; x ++) {
      for (let y = 0; y < 3; y ++) {
        if (x === 1 && y === 1)
          continue;
        if (this.getBlock(x, y, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT) !== centers[Block.FACE_FRONT])
          return false;
        if (this.getBlock(Cube.COL_RGT, x, y).getColorIndex(Block.FACE_RIGHT) !== centers[Block.FACE_RIGHT])
          return false;
        if (this.getBlock(x, y, Cube.FCE_BCK).getColorIndex(Block.FACE_BACK) !== centers[Block.FACE_BACK])
          return false;
        if (this.getBlock(Cube.COL_LFT, x, y).getColorIndex(Block.FACE_LEFT) !== centers[Block.FACE_LEFT])
          return false;
        if (this.getBlock(x, Cube.ROW_TOP, y).getColorIndex(Block.FACE_TOP) !== centers[Block.FACE_TOP])
          return false;
        if (this.getBlock(x, Cube.ROW_BTM, y).getColorIndex(Block.FACE_BOTTOM) !== centers[Block.FACE_BOTTOM])
          return false;
      }
    }

    return true;
  }

  isEditing() { return this.editOn != 0; }

  setSolving(flag) { this.solving = flag; }
  setAniDone(count) { this.aniDone = count; }
  setMoving(flag) {
    if (flag) {
      if (this.aniCount >= 0) 
        return false;
      this.aniCount = 0;
    }else{
      if (this.aniCount < this.aniDone)
        return false;
      this.aniCount = -1;
    }
    return true;
  }
  setEditing(edit) {
    if (this.aniCount >= 0 || (edit === (this.editOn === 1)))
      return false;

    this.editOn = (edit ? 1 : -1);
    this.aniCount = 1;

    return true;
  }

  rotateCol(col, down, record = false) {
    if (!this.setMoving(true)) return false;

    this.colRotIndex = col + 1;
    if (!down) this.colRotIndex *= -1;

    if (record)
      this.moves.push([Cube.MOVE_COL, col, down]);

    if (this.aniDone === 0) this.act();
    return true;
  }

  rotateRow(row, right, record = false) {
    if (!this.setMoving(true)) return false;

    this.rowRotIndex = row + 1;
    if (!right) this.rowRotIndex *= -1;

    if (record) 
      this.moves.push([Cube.MOVE_ROW, row, right]);

    if (this.aniDone === 0) this.act();
    return true;
  }

  rotateFace(face, clockwise, record = false) {
    if (!this.setMoving(true)) return false;

    this.faceRotIndex = face + 1;
    if (!clockwise) this.faceRotIndex *= -1;

    if (record)
      this.moves.push([Cube.MOVE_FCE, face, clockwise]);

    if (this.aniDone === 0) this.act();
    return true;
  }

  rotateXAxis(down, record = false) {
    if (!this.setMoving(true)) return false;

    this.cubeXRot = down ? 1 : -1;

    if (record)
      this.moves.push([Cube.MOVE_ROT_X, 0, down]);

    if (this.aniDone === 0) this.act();
    return true;
  }

  rotateYAxis(right, record = false) {
    if (!this.setMoving(true)) return false;

    this.cubeYRot = right ? 1 : -1;

    if (record)
      this.moves.push([Cube.MOVE_ROT_Y, 0, right]);

    if (this.aniDone === 0) this.act();
    return true;
  }

  rotateZAxis(clockwise, record = false) {
    if (!this.setMoving(true)) return false;

    this.cubeZRot = clockwise ? 1 : -1;

    if (record) 
      this.moves.push([Cube.MOVE_ROT_Z, 0, clockwise]);

    if (this.aniDone === 0) this.act();
    return true;
  }

  rotateBlockX(block, down) {
    if (!this.setMoving(true)) return false;
    
    this.blockXRotIndex = block + 1;
    if (!down) this.blockXRotIndex *= -1;

    if (this.aniDone === 0) this.act();
    return true;
  }
  rotateBlockY(block, right) {
    if (!this.setMoving(true)) return false;
    
    this.blockYRotIndex = block + 1;
    if (!right) this.blockYRotIndex *= -1;

    if (this.aniDone === 0) this.act();
    return true;
  }
  rotateBlockZ(block, clockwise) {
    if (!this.setMoving(true)) return false;
    
    this.blockZRotIndex = block + 1;
    if (!clockwise) this.blockZRotIndex *= -1;

    if (this.aniDone === 0) this.act();
    return true;
  }

  clearLog() { this.moves = []; }
  clearSolution() { this.solution = []; }
  clearUndo() { this.undo = []; }

  findSolution() {
    this.clearSolution();
    this.clearUndo();

    if (Cube.solver)
      this.solution = Cube.solver.findSolution(this);
    
    if (this.solution.length === 0 || this.solution[0][0] !== 9999) {
      this.solvable = true;
    }else{
      this.clearSolution();
      this.solvable = false;
    }
    return this.solvable;
  }

  runMove([type, index, forward]) {
    if (type == Cube.MOVE_COL)
      return this.rotateCol(index, forward);
    else if (type == Cube.MOVE_ROW)
      return this.rotateRow(index, forward);
    else if (type == Cube.MOVE_FCE)
      return this.rotateFace(index, forward);
    else if (type == Cube.MOVE_ROT_X)
      return this.rotateXAxis(forward);
    else if (type == Cube.MOVE_ROT_Y)
      return this.rotateYAxis(forward);
    else if (type == Cube.MOVE_ROT_Z)
      return this.rotateZAxis(forward);
    
    return false;
  }

  runReverse([type, index, forward]) {
    return this.runMove([type, index, !forward]);
  }

  runSolutionStep()
  {
    if (this.solution.length === 0)
      return false;
    
    let m = this.solution[0];
    if (!this.runMove(m))
      return false;
    
    this.undo.push([ m[0], m[1], !m[2] ]);
    
    this.solution.shift();
    return true;
  }

  runUndoStep() {
    if (this.undo.length === 0)
      return false;
    
    let m = this.undo[this.undo.length - 1];
    if (!this.runMove(m))
      return false;

    this.solution.unshift([ m[0], m[1], !m[2] ]);
    
    this.undo.pop();
    return true;
  }

  act() {
    let changed = this.aniCount <= 0;
    if (this.colRotIndex !== 0 || this.rowRotIndex !== 0 || this.faceRotIndex !== 0) {
      if (this.aniCount >= this.aniDone) {
        for (let i = 0; i < Cube.BLOCK_COUNT; i ++) {
          if (this.colRotIndex !== 0 && this.blocks[i].getX() === Math.abs(this.colRotIndex) - 1)
            this.blocks[i].rotateY(this.colRotIndex > 0);
          else if (this.rowRotIndex !== 0 && this.blocks[i].getY() === Math.abs(this.rowRotIndex) - 1)
            this.blocks[i].rotateX(this.rowRotIndex > 0);
          else if (this.faceRotIndex !== 0 && this.blocks[i].getZ() === Math.abs(this.faceRotIndex) - 1)
            this.blocks[i].rotateZ(this.faceRotIndex > 0);
        }
        
        this.colRotIndex = 0;
        this.rowRotIndex = 0;
        this.faceRotIndex = 0;
        this.setMoving(false);
        
        if (!this.solving) this.findSolution();
        changed = true;
      } else
        this.aniCount ++;
    }else if (this.blockXRotIndex !== 0 || this.blockYRotIndex !== 0 || this.blockZRotIndex !== 0) {
      if (this.aniCount >= this.aniDone) {
        if (this.blockXRotIndex != 0) {
          this.blocks[Math.abs(this.blockXRotIndex) - 1].rotateY(this.blockXRotIndex > 0, true);
          this.blocks[Math.abs(this.blockXRotIndex) - 1].setXRot(0.0);
        }else if (this.blockYRotIndex != 0) {
          this.blocks[Math.abs(this.blockYRotIndex) - 1].rotateX(this.blockYRotIndex > 0, true);
          this.blocks[Math.abs(this.blockYRotIndex) - 1].setYRot(0.0);
        }else if (this.blockZRotIndex != 0) {
          this.blocks[Math.abs(this.blockZRotIndex) - 1].rotateZ(this.blockZRotIndex > 0, true);
          this.blocks[Math.abs(this.blockZRotIndex) - 1].setZRot(0.0);
        }
        
        this.blockXRotIndex = 0;
        this.blockYRotIndex = 0;
        this.blockZRotIndex = 0;
        
        this.setMoving(false);
        
        if (!this.solving) this.findSolution();
        changed = true;
      } else {
        this.aniCount ++;
        
        let rot = (this.aniCount * 1.0) / (this.aniDone * 1.0) * 1.57079633;
        
        if (this.blockXRotIndex != 0) {
          if (this.blockXRotIndex < 0) rot *= -1.0;
          this.blocks[Math.abs(this.blockXRotIndex) - 1].setXRot(rot);
        }else if (this.blockYRotIndex != 0) {
          if (this.blockYRotIndex < 0) rot *= -1.0;
          this.blocks[Math.abs(this.blockYRotIndex) - 1].setYRot(rot);
        }else if (this.blockZRotIndex != 0) {
          if (this.blockZRotIndex > 0) rot *= -1.0;
          this.blocks[Math.abs(this.blockZRotIndex) - 1].setZRot(rot);
        }
      }
    }else if (this.cubeXRot != 0 || this.cubeYRot != 0 || this.cubeZRot != 0) {
      if (this.aniCount >= this.aniDone) {
        for (let i = 0; i < Cube.BLOCK_COUNT; i ++) {
          if (this.cubeXRot != 0)
            this.blocks[i].rotateY(this.cubeXRot > 0);
          else if (this.cubeYRot != 0)
            this.blocks[i].rotateX(this.cubeYRot > 0);
          else if (this.cubeZRot != 0)
            this.blocks[i].rotateZ(this.cubeZRot > 0);
        }
        
        this.cubeXRot = 0;
        this.cubeYRot = 0;
        this.cubeZRot = 0;
        this.setMoving(false);
        
        if (!this.solving) this.findSolution();
        changed = true;
      } else
        this.aniCount ++;
    }else if (this.editOn != 0 && this.aniCount > 0) {
      for (let i = 0; i < Cube.BLOCK_COUNT; i ++) {
        if (this.editOn > 0)
          this.blocks[i].setDistanceFromCenter(1.0 + (this.aniDone == 0 ? 1.0 : (this.aniCount * 1.0) / (this.aniDone * 1.0)));
        else
          this.blocks[i].setDistanceFromCenter(2.0 - (this.aniDone == 0 ? 1.0 : (this.aniCount * 1.0) / (this.aniDone * 1.0)));
      }
      
      if (this.aniCount >= this.aniDone) {
        this.setMoving(false);
        if (this.editOn <= 0) this.editOn = 0;
      } else
        this.aniCount ++;
      
      changed = true;
    }
    
    return changed;
  }

  draw(gl, programInfo, modelViewMatrix, selectMode = false) {
    for (let i = 0; i < Cube.BLOCK_COUNT; i ++) {
      let localMatrix = mat4.clone(modelViewMatrix);
      
      let rot = (this.aniCount * 1.0) / (this.aniDone * 1.0) * 1.57079633;
      if (this.cubeXRot != 0 || (this.colRotIndex != 0 && this.blocks[i].getX() == Math.abs(this.colRotIndex) - 1)) {
        if (this.colRotIndex < 0 || this.cubeXRot < 0) rot *= -1.0;
        mat4.rotate(localMatrix, localMatrix, rot, [1, 0, 0]);
      }else if (this.cubeYRot != 0 || (this.rowRotIndex != 0 && this.blocks[i].getY() == Math.abs(this.rowRotIndex) - 1)) {
        if (this.rowRotIndex < 0 || this.cubeYRot < 0) rot *= -1.0;
        mat4.rotate(localMatrix, localMatrix, rot, [0, 1, 0]);
      }else if (this.cubeZRot != 0 || (this.faceRotIndex != 0 && this.blocks[i].getZ() == Math.abs(this.faceRotIndex) - 1)) {
        if (this.faceRotIndex > 0 || this.cubeZRot > 0) rot *= -1.0;
        mat4.rotate(localMatrix, localMatrix, rot, [0, 0, 1]);
      }

      this.blocks[i].draw(gl, programInfo, localMatrix, selectMode);
    }
  }
}