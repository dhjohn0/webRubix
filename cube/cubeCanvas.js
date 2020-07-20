import GlWindow from '../gl-window.js';
import Block from './block.js'

function project(obj, modelview, projection, viewport) {
  // Transformation vectors
  let fTempo = [];
  // Modelview transform
  fTempo[0]=modelview[0]*obj.x+modelview[4]*obj.y+modelview[8]*obj.z+modelview[12]; // w is always 1
  fTempo[1]=modelview[1]*obj.x+modelview[5]*obj.y+modelview[9]*obj.z+modelview[13];
  fTempo[2]=modelview[2]*obj.x+modelview[6]*obj.y+modelview[10]*obj.z+modelview[14];
  fTempo[3]=modelview[3]*obj.x+modelview[7]*obj.y+modelview[11]*obj.z+modelview[15];
  // Projection transform, the final row of projection matrix is always [0 0 -1 0]
  // so we optimize for that.
  fTempo[4]=projection[0]*fTempo[0]+projection[4]*fTempo[1]+projection[8]*fTempo[2]+projection[12]*fTempo[3];
  fTempo[5]=projection[1]*fTempo[0]+projection[5]*fTempo[1]+projection[9]*fTempo[2]+projection[13]*fTempo[3];
  fTempo[6]=projection[2]*fTempo[0]+projection[6]*fTempo[1]+projection[10]*fTempo[2]+projection[14]*fTempo[3];
  fTempo[7]=-fTempo[2];
  // The result normalizes between -1 and 1
  if(fTempo[7]==0.0) // The w value
      return 0;
  fTempo[7]=1.0/fTempo[7];
  // Perspective division
  fTempo[4]*=fTempo[7];
  fTempo[5]*=fTempo[7];
  fTempo[6]*=fTempo[7];

  return {
    x: (fTempo[4]*0.5+0.5)*viewport[2]+viewport[0],
    y: (fTempo[5]*0.5+0.5)*viewport[3]+viewport[1],
    z: (1.0+fTempo[6])*0.5
  };
}

function distance(a, b) {
  let x = b.x - a.x;
  let y = b.y - a.y;
  return Math.sqrt(x * x + y * y);
}

function findAngle(x, y) {
  let angle = Math.acos( x / Math.sqrt(x * x + y * y) );
	if (y < 0.0)
		angle = Math.PI * 2.0 - angle;
	return angle;
}

function anglesClose(angle1, angle2) {
  if (angle2 < angle1)
	{
		let t = angle1;
		angle1 = angle2;
		angle2 = t;
	}
	if (angle1 + Math.PI * 2.0 > angle2 - 0.4 && angle1 + Math.PI * 2.0 < angle2 + 0.4)
		return true;
	return angle1 > angle2 - 0.4 && angle1 < angle2 + 0.4;
}

export default class CubeCanvas {
  static MOUSE_UP   = 0
  static MOUSE_DOWN = 1
  static DRAG_DEADZONE = 20

  constructor(cube, htmlCanvas) {
    this.cube = cube;
    this.canvas = htmlCanvas;

    this.mouse = {
      x: 0,
      y: 0,
      state: CubeCanvas.MOUSE_UP
    };
    this.selected = null;
    this.mouseEnabled = true;

    this.glWindow = new GlWindow(this.canvas);
    this.gl = this.glWindow.gl;

    this.glWindow.setMouseDown(this.mouseDown);
    this.glWindow.setMouseUp(this.mouseUp);
    this.glWindow.setMouseMove(this.mouseMove);
    this.glWindow.setRender(this.draw);

    this.glWindow.setClearColor([0.1, 0.1, 0.1, 1.0]);
    this.rotation = { x: 45, y: 45, z: 0 }

    //mat4.rotate(this.mvMatrix, this.mvMatrix, 1.57079633 / 2, [1, 0, 0]);
    //mat4.rotate(this.mvMatrix, this.mvMatrix, 1.57079633 / 2, [0, 1, 0]);

    CubeCanvas.initBuffers(this.gl);
    Block.initBuffers(this.gl);
    this.textures = {
      block: this.glWindow.loadTexture('texture.png'),
      white: this.glWindow.createTexture(255, 255, 255, 255)
    };
    Block.setTextures(this.textures);
  }

  setMouseEnabled(flag) { this.mouseEnabled = flag; }

  mouseDown = (e) => {
    var rect = this.canvas.getBoundingClientRect();
    let c = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (this.mouseEnabled && !this.cube.isMoving()) {
      this.mouse = {
        x: c.x,
        y: c.y,
        state: CubeCanvas.MOUSE_DOWN
      }
      console.log(this.mouse);
      
      this.draw(this.gl, this.glWindow.programInfo, 0, true);
      var pixels = new Uint8Array(4);
      this.gl.readPixels(c.x, this.canvas.height - c.y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

      let pick = Block.decodeColor(pixels);
      if (pick) {
        let block = this.cube.getBlock(pick[0], pick[1], pick[2]);
        if (block)
          this.selected = {
            block: block,
            face: pick[3],
            highlight: -1
          };
      } else {
        this.selected = null;
      }
    }
  }

  mouseUp = (e) => {
    this.mouse.state = CubeCanvas.MOUSE_UP;

    if (this.mouseEnabled && !this.cube.isMoving() && this.selected) {
      if (this.selected.highlight >= 0) {
        this.cube.setSolving(false);
        this.cube.clearUndo();

        if (this.cube.isEditing()) {
          let block = this.cube.getBlockIndex(this.selected.block);

          if (this.selected.face == 0 || this.selected.face == 2) {
            if (this.selected.highlight == 0)
              this.cube.rotateBlockY(block, true);
            else if (this.selected.highlight == 1)
              this.cube.rotateBlockX(block, this.selected.face != 0);
            else if (this.selected.highlight == 2)
              this.cube.rotateBlockY(block, false);
            else if (this.selected.highlight == 3)
              this.cube.rotateBlockX(block, this.selected.face == 0);
          }else if (this.selected.face == 1 || this.selected.face == 3) {
            if (this.selected.highlight == 0)
              this.cube.rotateBlockY(block, true);
            else if (this.selected.highlight == 1)
              this.cube.rotateBlockZ(block, this.selected.face != 1);
            else if (this.selected.highlight == 2)
              this.cube.rotateBlockY(block, false);
            else if (this.selected.highlight == 3)
              this.cube.rotateBlockZ(block, this.selected.face == 1);
          }else if (this.selected.face == 4 || this.selected.face == 5) {
            if (this.selected.highlight == 0)
              this.cube.rotateBlockZ(block, this.selected.face == 4);
            else if (this.selected.highlight == 1)
              this.cube.rotateBlockX(block, false);
            else if (this.selected.highlight == 2)
              this.cube.rotateBlockZ(block, this.selected.face != 4);
            else if (this.selected.highlight == 3)
              this.cube.rotateBlockX(block, true);
          }
        } else {
          let block = this.selected.block;

          if (this.selected.face == 0 || this.selected.face == 2) {
            if (this.selected.highlight == 0)
              this.cube.rotateRow(block.y, true);
            else if (this.selected.highlight == 1)
              this.cube.rotateCol(block.x, this.selected.face != 0);
            else if (this.selected.highlight == 2)
              this.cube.rotateRow(block.y, false);
            else if (this.selected.highlight == 3)
              this.cube.rotateCol(block.x, this.selected.face == 0);
          }else if (this.selected.face == 1 || this.selected.face == 3) {
            if (this.selected.highlight == 0)
              this.cube.rotateRow(block.y, true);
            else if (this.selected.highlight == 1)
              this.cube.rotateFace(block.z, this.selected.face != 1);
            else if (this.selected.highlight == 2)
              this.cube.rotateRow(block.y, false);
            else if (this.selected.highlight == 3)
              this.cube.rotateFace(block.z, this.selected.face == 1);
          }else if (this.selected.face == 4 || this.selected.face == 5) {
            if (this.selected.highlight == 0)
              this.cube.rotateFace(block.z, this.selected.face == 4);
            else if (this.selected.highlight == 1)
              this.cube.rotateCol(block.x, false);
            else if (this.selected.highlight == 2)
              this.cube.rotateFace(block.z, this.selected.face != 4);
            else if (this.selected.highlight == 3)
              this.cube.rotateCol(block.x, true);
          }
        }
      }
      this.selected = null;
    }
  }

  mouseMove = (e) => {
    var rect = this.canvas.getBoundingClientRect();
    let c = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (!this.mouseEnabled || this.cube.isMoving() || !this.selected) {
      if (this.mouse.state === CubeCanvas.MOUSE_DOWN) {
        this.rotation.x += c.y - this.mouse.y;
        if (this.rotation.x < -80) this.rotation.x = -80;
        if (this.rotation.x > 80) this.rotation.x = 80;

        this.rotation.y = (this.rotation.y + c.x - this.mouse.x) % 360;
      }

      this.mouse.x = c.x;
      this.mouse.y = c.y;

      console.log(this.mouse);
    }else if (this.mouseEnabled && !this.cube.isMoving() && this.selected) {
      if (distance({x: this.mouse.x, y: this.mouse.y}, c) < CubeCanvas.DRAG_DEADZONE) {
        this.selected.highlight = -1;
        return;
      }

      const sel = {
        x: this.selected.block.getX(),
        y: this.selected.block.getY(),
        z: this.selected.block.getZ()
      };

      const viewport = [0, 0, this.canvas.width, this.canvas.height];
      const angleCenter = project(sel, this.mvMatrix, this.projMatrix, viewport);

      const mAngle = findAngle(c.x - this.mouse.x, (this.canvas.height - c.y) - (this.canvas.height - this.mouse.y));

      let highlightTests = [];
      if (this.selected.face == 0) {
        highlightTests.push(project({x: sel.x + 1, y: sel.y, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y + 1, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x - 1, y: sel.y, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y - 1, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
      }else if (this.selected.face == 2) {
        highlightTests.push(project({x: sel.x - 1, y: sel.y, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y + 1, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x + 1, y: sel.y, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y - 1, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
      }else if (this.selected.face == 3) {
        highlightTests.push(project({x: sel.x, y: sel.y, z: sel.z + 1}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y + 1, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y, z: sel.z - 1}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y - 1, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
      }else if (this.selected.face == 1) {
        highlightTests.push(project({x: sel.x, y: sel.y, z: sel.z - 1}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y + 1, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y, z: sel.z + 1}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y - 1, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
      }else if (this.selected.face == 4) {
        highlightTests.push(project({x: sel.x + 1, y: sel.y, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y, z: sel.z - 1}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x - 1, y: sel.y, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y, z: sel.z + 1}, this.mvMatrix, this.projMatrix, viewport));
      }else if (this.selected.face == 5) {
        highlightTests.push(project({x: sel.x + 1, y: sel.y, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y, z: sel.z + 1}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x - 1, y: sel.y, z: sel.z}, this.mvMatrix, this.projMatrix, viewport));
        highlightTests.push(project({x: sel.x, y: sel.y, z: sel.z - 1}, this.mvMatrix, this.projMatrix, viewport));
      }

      this.selected.highlight = highlightTests.findIndex((t, i) => {
        return anglesClose(mAngle, findAngle(t.x - angleCenter.x, (t.y) - (angleCenter.y)));
      });
    }
  }
  
  draw = (gl, programInfo, deltaTime, selectMode = false) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    this.projMatrix = mat4.create();
    mat4.perspective(this.projMatrix, fieldOfView, aspect, zNear, zFar);

    this.mvMatrix = mat4.create();
    mat4.translate(this.mvMatrix, this.mvMatrix, [-0.0, 0.0, -15.0]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, this.rotation.x / 360.0 * 6.28318531, [1, 0, 0]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, this.rotation.y / 360.0 * 6.28318531, [0, 1, 0]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, this.rotation.z / 360.0 * 6.28318531, [0, 0, 1]);

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix, false, this.projMatrix
    );
    
    cube.draw(gl, programInfo, this.mvMatrix, window.forceSelectMode || selectMode);

    if (!selectMode && this.selected) {
      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.blendEquation(gl.FUNC_ADD);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, Block.textures.block);
      gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

      const offset = this.cube.isEditing() ? 2 : 1;
      const block = this.selected.block;

      let matrix = mat4.clone(this.mvMatrix);

      mat4.translate(matrix, matrix, [
        (block.x - 1.0) * offset, (block.y - 1.0) * offset, (block.z - 1.0) * offset
      ]);
      if (this.selected.face == 1)
        mat4.rotate(matrix, matrix, 1.57079633, [0, 1, 0]);
      else if (this.selected.face == 2)
        mat4.rotate(matrix, matrix, 3.14159265, [0, 1, 0]);
      else if (this.selected.face == 3)
        mat4.rotate(matrix, matrix, 4.71238898, [0, 1, 0]);
      else if (this.selected.face == 4)
        mat4.rotate(matrix, matrix, 4.71238898, [1, 0, 0]);
      else if (this.selected.face == 5)
        mat4.rotate(matrix, matrix, 1.57079633, [1, 0, 0]);
      
      for (let i = 0; i < 4; i ++) {
        gl.uniformMatrix4fv(
          programInfo.uniformLocations.modelViewMatrix, false, matrix
        );
        
        gl.bindBuffer(gl.ARRAY_BUFFER, CubeCanvas.buffers.position);
        gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          3, gl.FLOAT,
          false, 0, 0
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, CubeCanvas.buffers.texture);
        gl.vertexAttribPointer(
          programInfo.attribLocations.textureCoord,
          2, gl.FLOAT,
          false, 0, 0
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, CubeCanvas.buffers.colors[this.selected.highlight === i ? 'opaque' : 'transparent']);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            4, gl.FLOAT,
            false, 0, 0
        );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CubeCanvas.buffers.indices);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        mat4.rotate(matrix, matrix, 1.57079633, [0, 0, 1]);
      }

      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
    }
  }

  static initBuffers(gl) {
    const posBuffer = gl.createBuffer();
    const position = [
       1.5,  0.5,  0.51,
       0.5,  0.5,  0.51,
       0.5, -0.5,  0.51,
       1.5, -0.5,  0.51
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

    const texBuffer = gl.createBuffer();
    const texPos = [
      1.0, Block.TEXTURE_SIZE,
      0.5, Block.TEXTURE_SIZE,
      0.5, 0.0,
      1.0, 0.0
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texPos), gl.STATIC_DRAW);

    const colorBuffers = {
      opaque: gl.createBuffer(),
      transparent: gl.createBuffer()
    };
    const colorPack = [
      [
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1
      ],[
        1, 1, 1, 0.2,
        1, 1, 1, 0.2,
        1, 1, 1, 0.2,
        1, 1, 1, 0.2
      ]
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffers.opaque);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorPack[0]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffers.transparent);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorPack[1]), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    const indices = [ 0, 1, 2,  0, 2, 3 ];
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    this.buffers = {
      position: posBuffer,
      texture: texBuffer,
      colors: colorBuffers,
      indices: indexBuffer
    };
  }
}