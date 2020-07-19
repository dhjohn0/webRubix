import Solver from './solver.js'

import Cube from "./cube.js";
import Block from './block.js';

export default class ByLayer extends Solver {
  constructor() {
    super();
  }

  solveTopLayer(cube) {
    cube.clearLog();

    let topColor = cube.getBlock(Cube.COL_RGT, Cube.ROW_TOP, Cube.FCE_FNT).getColorIndex(Block.FACE_TOP);
    let primed = false;
    for (let i = 0; i < 4; i ++) {
      if (cube.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_MID).getColorIndex(Block.FACE_TOP) === topColor) {
        primed = true;
        break;
      }
      cube.rotateCol(Cube.COL_MID, true, true);
    }
    if (!primed) {
      for (let i = 0; i < 4; i ++) {
        if (cube.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_MID).getColorIndex(Block.FACE_TOP) === topColor) {
          primed = true;
          break;
        }
        cube.rotateFace(Cube.FCE_MID, true, true);
      }
    }
    
    for (let i = 0; i < 3; i ++) {
      cube.rotateYAxis(false, true);
      
      let frontColor = cube.getBlock(Cube.COL_LFT, Cube.ROW_TOP, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT);
      let notColor = cube.getBlock(Cube.COL_LFT, Cube.ROW_TOP, Cube.FCE_FNT).getColorIndex(Block.FACE_LEFT);
      
      let b = null;
      for (let ii = 0; ii < Cube.BLOCK_COUNT; ii ++) {
        b = cube.getBlock(ii);
        if (b.isCorner() && b.hasColor(topColor) && b.hasColor(frontColor) && !b.hasColor(notColor))
          break;
      }
      
      for (let ii = 0; ii < Cube.BLOCK_COUNT; ii ++) {
        if (b.getY() != Cube.ROW_TOP || b.getZ() != Cube.FCE_BCK)
          break;
        
        if (i == 0)
          cube.rotateFace(Cube.FCE_BCK, true, true);
        else if (i == 1)
          cube.rotateCol(Cube.COL_RGT, true, true);
      }
      
      for (let ii = 0; ii < Cube.BLOCK_COUNT; ii ++)
      {
        if (b.getY() != Cube.ROW_BTM || (b.getZ() == Cube.FCE_FNT && b.getX() == Cube.COL_RGT))
          break;
        cube.rotateRow(Cube.ROW_BTM, true, true);
      }
      
      if (b.getY() === Cube.ROW_TOP) {
        let face = b.getFaceOfColor(topColor);
        if (face === Block.FACE_FRONT) {
          cube.rotateFace(Cube.FCE_FNT, true, true);
          cube.rotateRow(Cube.ROW_BTM, true, true);
          cube.rotateFace(Cube.FCE_FNT, false, true);
          cube.rotateRow(Cube.ROW_BTM, true, true);
          cube.rotateRow(Cube.ROW_BTM, true, true);
          cube.rotateCol(Cube.COL_RGT, true, true);
          cube.rotateRow(Cube.ROW_BTM, true, true);
          cube.rotateCol(Cube.COL_RGT, false, true);
        }else if (face === Block.FACE_RIGHT) {
          cube.rotateCol(Cube.COL_RGT, true, true);
          cube.rotateRow(Cube.ROW_BTM, false, true);
          cube.rotateCol(Cube.COL_RGT, false, true);
          cube.rotateRow(Cube.ROW_BTM, true, true);
          cube.rotateCol(Cube.COL_RGT, true, true);
          cube.rotateRow(Cube.ROW_BTM, false, true);
          cube.rotateCol(Cube.COL_RGT, false, true);
        }
      }else if (b.getY() === Cube.ROW_BTM) {
        let face = b.getFaceOfColor(topColor);
        if (face === Block.FACE_RIGHT)
        {
          cube.rotateCol(Cube.COL_RGT, true, true);
          cube.rotateRow(Cube.ROW_BTM, false, true);
          cube.rotateCol(Cube.COL_RGT, false, true);
        }else if (face === Block.FACE_FRONT)
        {
          cube.rotateRow(Cube.ROW_BTM, false, true);
          cube.rotateCol(Cube.COL_RGT, true, true);
          cube.rotateRow(Cube.ROW_BTM, true, true);
          cube.rotateCol(Cube.COL_RGT, false, true);
        }else if (face === Block.FACE_BOTTOM)
        {
          cube.rotateCol(Cube.COL_RGT, true, true);
          cube.rotateRow(Cube.ROW_BTM, true, true);
          cube.rotateCol(Cube.COL_RGT, false, true);
          cube.rotateRow(Cube.ROW_BTM, true, true);
          cube.rotateRow(Cube.ROW_BTM, true, true);
          cube.rotateCol(Cube.COL_RGT, true, true);
          cube.rotateRow(Cube.ROW_BTM, false, true);
          cube.rotateCol(Cube.COL_RGT, false, true);
        }
      }
    }
    
    for (let i = 0; i < 4; i ++) {
      let frontColor = cube.getBlock(Cube.COL_RGT, Cube.ROW_TOP, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT);
      
      let b = 0;
      for (let ii = 0; ii < Cube.BLOCK_COUNT; ii ++) {
        b = cube.getBlock(ii);
        if (b.isEdge() && b.hasColor(topColor) && b.hasColor(frontColor))
          break;
      }
      
      if (b.getY() == Cube.ROW_TOP) {
        let rots;
        for (rots = 0; rots < 4; rots ++) {
          if (b.getZ() === Cube.FCE_FNT) break;
          cube.rotateYAxis(false, true);
        }
        
        cube.rotateCol(Cube.COL_MID, true , true);
        cube.rotateRow(Cube.ROW_BTM, false, true);
        cube.rotateRow(Cube.ROW_BTM, false, true);
        cube.rotateCol(Cube.COL_MID, false, true);
        
        if (rots > 0) {
          for (; rots < 4; rots ++)
            cube.rotateYAxis(false, true);
        }
      }
      
      if (b.getY() != Cube.ROW_TOP) {
        for (let ii = 0; ii < 4; ii ++) {
          if (b.getY() == Cube.ROW_MID && b.getX() == Cube.COL_RGT && b.getZ() == Cube.FCE_FNT)
            break;
          else if (b.getY() == Cube.ROW_BTM && b.getZ() == Cube.FCE_FNT)
            break;
          
          cube.rotateRow(b.getY(), false, true);
        }
      }
        
      let face = b.getFaceOfColor(topColor);
      if (b.getY() == Cube.ROW_BTM) {
        if (face == Block.FACE_BOTTOM) {
          cube.rotateCol (Cube.COL_MID, true , true);
          cube.rotateRow (Cube.ROW_BTM, false, true);
          cube.rotateRow (Cube.ROW_BTM, false, true);
          cube.rotateCol (Cube.COL_MID, false, true);
        } else {
          cube.rotateRow (Cube.ROW_BTM, false, true);
          cube.rotateCol (Cube.COL_MID, true , true);
          cube.rotateRow (Cube.ROW_BTM, true , true);
          cube.rotateCol (Cube.COL_MID, false, true);
        }
      }else if (b.getY() == Cube.ROW_MID) {
        if (face == Block.FACE_RIGHT) {
          cube.rotateRow (Cube.ROW_MID, true , true);
          cube.rotateFace(Cube.FCE_FNT, true , true);
          cube.rotateRow (Cube.ROW_MID, false, true);
          cube.rotateFace(Cube.FCE_FNT, false, true);
        } else {
          cube.rotateRow (Cube.ROW_MID, true , true);
          cube.rotateFace(Cube.FCE_FNT, false, true);
          cube.rotateRow (Cube.ROW_MID, false, true);
          cube.rotateRow (Cube.ROW_MID, false, true);
          cube.rotateFace(Cube.FCE_FNT, true , true);
        }
      }
      
      cube.rotateYAxis(false, true);
    }
    
    return cube.getLog();
  }

  solveMiddleLayer(cube) {
    let frontColor = cube.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT);
    cube.clearLog();
    for (let i = 0; i < 4; i ++) {
      if (frontColor == cube.getBlock(Cube.COL_MID, Cube.ROW_MID, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT))
        break;
      cube.rotateRow(Cube.ROW_MID, true, true);  cube.act();
    }
    
    for (let i = 0; i < 4; i ++) {
      frontColor = cube.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT);
      let rightColor = cube.getBlock(Cube.COL_RGT, Cube.ROW_MID, Cube.FCE_MID).getColorIndex(Block.FACE_RIGHT);
      
      let b = 0;
      for (let ii = 0; ii < Cube.BLOCK_COUNT; ii ++) {
        b = cube.getBlock(ii);
        if (b.isEdge() && b.hasColor(frontColor) && b.hasColor(rightColor))
          break;
      }
      
      if (
        b.getY() == Cube.ROW_MID && (b.getX() != Cube.COL_RGT || b.getZ() != Cube.FCE_FNT || 
        b.getColorIndex(Block.FACE_FRONT) != frontColor)
      ) {
        let rot;
        for (rot = 0; rot < 4; rot ++) {
          if (b.getX() == Cube.COL_RGT && b.getZ() == Cube.FCE_FNT)
            break;
          cube.rotateYAxis(true, true);
        }
        
        cube.rotateRow (Cube.ROW_BTM, false, true); cube.act();
        cube.rotateCol (Cube.COL_RGT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_BTM, true , true); cube.act();
        cube.rotateCol (Cube.COL_RGT, false, true); cube.act();
        cube.rotateRow (Cube.ROW_BTM, true , true); cube.act();
        cube.rotateFace(Cube.FCE_FNT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_BTM, false, true); cube.act();
        cube.rotateFace(Cube.FCE_FNT, false, true); cube.act();
        
        if (rot > 0) {
          for (; rot < 4; rot ++)
            cube.rotateYAxis(true, true);
        }
      }
      
      for (let ii = 0; ii < 4; ii ++) {
        if (b.getZ() == Cube.FCE_FNT)
          break;
        cube.rotateRow(Cube.ROW_BTM, false, true);
      }
      
      if (b.getY() == Cube.ROW_BTM) {
        if (b.getColorIndex(Block.FACE_FRONT) == frontColor) {
          cube.rotateRow (Cube.ROW_BTM, false, true); cube.act();
          cube.rotateCol (Cube.COL_RGT, true , true); cube.act();
          cube.rotateRow (Cube.ROW_BTM, true , true); cube.act();
          cube.rotateCol (Cube.COL_RGT, false, true); cube.act();
          cube.rotateRow (Cube.ROW_BTM, true , true); cube.act();
          cube.rotateFace(Cube.FCE_FNT, true , true); cube.act();
          cube.rotateRow (Cube.ROW_BTM, false, true); cube.act();
          cube.rotateFace(Cube.FCE_FNT, false, true); cube.act();
        } else {
          cube.rotateRow (Cube.ROW_BTM, true , true); cube.act();
          cube.rotateYAxis(false, true); cube.act();
          cube.rotateRow (Cube.ROW_BTM, true , true); cube.act();
          cube.rotateCol (Cube.COL_LFT, true , true); cube.act();
          cube.rotateRow (Cube.ROW_BTM, false, true); cube.act();
          cube.rotateCol (Cube.COL_LFT, false, true); cube.act();
          cube.rotateRow (Cube.ROW_BTM, false, true); cube.act();
          cube.rotateFace(Cube.FCE_FNT, false, true); cube.act();
          cube.rotateRow (Cube.ROW_BTM, true , true); cube.act();
          cube.rotateFace(Cube.FCE_FNT, true , true); cube.act();
          cube.rotateYAxis(true, true); cube.act();
        }
      }
      
      cube.rotateYAxis(true, true);
    }
    
    return cube.getLog();
  }

  solveBottomLayer(cube) {
    cube.clearLog();
    
    cube.rotateXAxis(true, true); cube.act();
    cube.rotateXAxis(true, true); cube.act();
    
    let topColor = cube.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_MID).getColorIndex(Block.FACE_TOP);
    for (let i = 0; i < 4; i ++) {
      let frontColor = cube.getBlock(Cube.COL_MID, Cube.ROW_MID, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT);
      let rightColor = cube.getBlock(Cube.COL_RGT, Cube.ROW_MID, Cube.FCE_MID).getColorIndex(Block.FACE_RIGHT);
      
      let b = 0;
      for (let ii = 0; ii < Cube.BLOCK_COUNT; ii ++) {
        b = cube.getBlock(ii);
        if (b.isCorner() && b.hasColor(frontColor) && b.hasColor(rightColor)  && b.hasColor(topColor))
          break;
      }
      
      if (
        (b.getX() == Cube.COL_LFT && b.getZ() == Cube.FCE_FNT) || 
        (b.getX() == Cube.COL_RGT && b.getZ() == Cube.FCE_BCK)
      ) {
        let sv = false;
        if (b.getX() == Cube.COL_RGT && b.getZ() == Cube.FCE_BCK) {
          sv = true;
          cube.rotateRow (Cube.ROW_TOP, false, true); cube.act();
        }
        cube.rotateCol (Cube.COL_LFT, false, true); cube.act();
        cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
        cube.rotateCol (Cube.COL_LFT, true , true); cube.act();
        cube.rotateFace(Cube.FCE_FNT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_TOP, false, true); cube.act();
        cube.rotateFace(Cube.FCE_FNT, false, true); cube.act();
        cube.rotateCol (Cube.COL_LFT, false, true); cube.act();
        cube.rotateRow (Cube.ROW_TOP, false, true); cube.act();
        cube.rotateCol (Cube.COL_LFT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_TOP, false, true); cube.act();
        if (!sv)
          cube.rotateRow (Cube.ROW_TOP, false, true); cube.act();
      }else if (b.getZ() == Cube.COL_LFT && b.getZ() == Cube.FCE_BCK) {
        cube.rotateYAxis(true, true);
        
        for (let ii = 0; ii < 2; ii ++) {
          if (ii == 1)
            cube.rotateRow (Cube.ROW_TOP, false, true);
          cube.rotateCol (Cube.COL_LFT, false, true);
          cube.rotateRow (Cube.ROW_TOP, true , true);
          cube.rotateCol (Cube.COL_LFT, true , true);
          cube.rotateFace(Cube.FCE_FNT, true , true);
          cube.rotateRow (Cube.ROW_TOP, false, true);
          cube.rotateFace(Cube.FCE_FNT, false, true);
          cube.rotateCol (Cube.COL_LFT, false, true);
          cube.rotateRow (Cube.ROW_TOP, false, true);
          cube.rotateCol (Cube.COL_LFT, true , true);
          cube.rotateRow (Cube.ROW_TOP, false, true);
          if (ii == 0)
            cube.rotateRow (Cube.ROW_TOP, false, true);
        }
        
        cube.rotateYAxis(false, true);
      }
      
      cube.rotateYAxis(true, true); cube.act();
    
    }
	
    for (let i = 0; i < 4; i ++)
    {
      let frontColor = cube.getBlock(Cube.COL_MID, Cube.ROW_MID, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT);
      let rightColor = cube.getBlock(Cube.COL_RGT, Cube.ROW_MID, Cube.FCE_MID).getColorIndex(Block.FACE_RIGHT);
      
      let b = cube.getBlock(Cube.COL_RGT, Cube.ROW_TOP, Cube.FCE_FNT);
      
      if (!b.hasColor(topColor) || !b.hasColor(frontColor) || !b.hasColor(rightColor))
      {
        //cout << "Errored" << endl;
        return cube.getLog();
      }
      
      cube.rotateYAxis(false, false); cube.act();
    }
    
    //cout << "  Solving Corners..." << endl;
    for (let i = 0; i < 3; i ++)
    {
      let frontColor = cube.getBlock(Cube.COL_MID, Cube.ROW_MID, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT);
      let b = cube.getBlock(Cube.COL_RGT, Cube.ROW_TOP, Cube.FCE_FNT);
      
      for (let ii = 0; ii < 100; ii ++)
      {
        if (b.getColorIndex(Block.FACE_TOP) == topColor && b.getColorIndex(Block.FACE_FRONT) == frontColor)
          break;
        
        cube.rotateCol (Cube.COL_RGT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_BTM, true , true); cube.act();
        cube.rotateCol (Cube.COL_RGT, false, true); cube.act();
        cube.rotateFace(Cube.FCE_FNT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_BTM, true , true); cube.act();
        cube.rotateFace(Cube.FCE_FNT, false, true); cube.act();
        cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
        cube.rotateFace(Cube.FCE_FNT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_BTM, false, true); cube.act();
        cube.rotateFace(Cube.FCE_FNT, false, true); cube.act();
        cube.rotateCol (Cube.COL_RGT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_BTM, false, true); cube.act();
        cube.rotateCol (Cube.COL_RGT, false, true); cube.act();
        cube.rotateRow (Cube.ROW_TOP, false, true); cube.act();
      }
      
      cube.rotateYAxis(true, true); cube.act();
    }
    
    let foundEdge = false;
    for (let i = 0; i < 4; i ++)
    {
      let frontColor = cube.getBlock(Cube.COL_MID, Cube.ROW_MID, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT);
      let b = cube.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_FNT);
      if (b.getColorIndex(Block.FACE_TOP) == frontColor || b.getColorIndex(Block.FACE_FRONT) == frontColor)
      {
        foundEdge = true;
        break;
      }
      cube.rotateYAxis(false, true);
    }
    if (!foundEdge)
    {
      cube.rotateCol (Cube.COL_MID, false, true); cube.act();
      cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
      cube.rotateCol (Cube.COL_MID, true , true); cube.act();
      cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
      cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
      cube.rotateCol (Cube.COL_MID, false, true); cube.act();
      cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
      cube.rotateCol (Cube.COL_MID, true , true); cube.act();
      
      for (let i = 0; i < 4; i ++)
      {
        let frontColor = cube.getBlock(Cube.COL_MID, Cube.ROW_MID, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT);
        let b = cube.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_FNT);
        if (b.getColorIndex(Block.FACE_TOP) == frontColor || b.getColorIndex(Block.FACE_FRONT) == frontColor)
          break;
        cube.rotateYAxis(false, true); cube.act();
      }
    }
    
    for (let i = 0; i < 2; i ++)
    {
      let solved = true;
      for (let ii = 0; ii < 4; ii ++)
      {
        if (solved)
        {
          let frontColor = cube.getBlock(Cube.COL_MID, Cube.ROW_MID, Cube.FCE_FNT).getColorIndex(Block.FACE_FRONT);
          let b = cube.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_FNT);
          if (b.getColorIndex(Block.FACE_TOP) != frontColor && b.getColorIndex(Block.FACE_FRONT) != frontColor)
            solved = false;
        }
        cube.rotateYAxis(true); cube.act();
      }
      if (solved) break;
      
      cube.rotateCol (Cube.COL_MID, false, true); cube.act();
      cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
      cube.rotateCol (Cube.COL_MID, true , true); cube.act();
      cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
      cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
      cube.rotateCol (Cube.COL_MID, false, true); cube.act();
      cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
      cube.rotateCol (Cube.COL_MID, true , true); cube.act();
    }
    
    for (let ii = 0; ii < 4; ii ++)
    {
      let b = cube.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_FNT);
      if (b.getColorIndex(Block.FACE_TOP) != topColor)
      {
        let isFish = false;
        let isLeft = false;
        if (cube.getBlock(Cube.COL_MID, Cube.ROW_TOP, Cube.FCE_BCK).getColorIndex(Block.FACE_TOP) == topColor)
        {
          isFish = true;
          
          if (cube.getBlock(Cube.COL_LFT, Cube.ROW_TOP, Cube.FCE_MID).getColorIndex(Block.FACE_TOP) != topColor)
          {
            cube.rotateYAxis(true, true); cube.act();
            isLeft = true;
          }
          
          cube.rotateFace(Cube.FCE_FNT, false, true); cube.act();
          cube.rotateCol (Cube.COL_LFT, false, true); cube.act();
        }else
        { cube.rotateYAxis(true, true); cube.act(); }
        
        cube.rotateCol (Cube.COL_RGT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_MID, false, true); cube.act();
        cube.rotateCol (Cube.COL_RGT, true , true); cube.act();
        cube.rotateCol (Cube.COL_RGT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_MID, false, true); cube.act();
        cube.rotateRow (Cube.ROW_MID, false, true); cube.act();
        cube.rotateCol (Cube.COL_RGT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
        cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
        cube.rotateCol (Cube.COL_RGT, false, true); cube.act();
        cube.rotateRow (Cube.ROW_MID, true , true); cube.act();
        cube.rotateRow (Cube.ROW_MID, true , true); cube.act();
        cube.rotateCol (Cube.COL_RGT, true , true); cube.act();
        cube.rotateCol (Cube.COL_RGT, true , true); cube.act();
        cube.rotateRow (Cube.ROW_MID, true , true); cube.act();
        cube.rotateCol (Cube.COL_RGT, false, true); cube.act();
        cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
        cube.rotateRow (Cube.ROW_TOP, true , true); cube.act();
        if (isFish)
        {
          cube.rotateCol (Cube.COL_LFT, true , true); cube.act();
          cube.rotateFace(Cube.FCE_FNT, true , true); cube.act();
          
          if (isLeft)
          { cube.rotateYAxis(false, true); cube.act(); }
        }else
        { cube.rotateYAxis(false, true); cube.act(); }
        
      }
      cube.rotateYAxis(true, true); cube.act();
    }
    
    return cube.getLog();
  }

  findSolution(cube) {
    let c = new Cube(cube);
    c.setSolving(true);
    c.setAniDone(0);
    let moves = [];

    if (c.isSolved()) return moves;

    moves = moves.concat(this.solveTopLayer(c));
    moves = moves.concat(this.solveMiddleLayer(c));
    moves = moves.concat(this.solveBottomLayer(c));

    c.clearLog();

    /*while (moves.length > 0) {
      let o = moves[moves.length - 1];
      if (o[0] !== Cube.MOVE_ROT_X && o[0] !== Cube.MOVE_ROT_Y && o[0] !== Cube.MOVE_ROT_Z)
        break;
      moves.pop();
    }*/

    if (!c.isSolved()) {
      return [[9999, 9999, 9999]];
    }

    return moves;
  }
}