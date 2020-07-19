export default class Block {
  static FACE_FRONT  = 0
  static FACE_RIGHT  = 1
  static FACE_BACK   = 2
  static FACE_LEFT   = 3
  static FACE_TOP    = 4
  static FACE_BOTTOM = 5
  static FACE_NONE   = 6

  static TEXTURE_SIZE = 0.142857143

  constructor(x, y, z) {
    if (typeof(y) === 'undefined' && typeof(z) === 'undefined') {
      let block = x;

      this.x = block.getX();
      this.y = block.getY();
      this.z = block.getZ();

      this.colors = block.colors.map(i => i);
      this.visible = block.visible.map(i => i);
    }else{
      this.x = x;
      this.y = y;
      this.z = z;

      this.colors = [
        Block.FACE_FRONT,
        Block.FACE_RIGHT,
        Block.FACE_BACK,
        Block.FACE_LEFT,
        Block.FACE_TOP,
        Block.FACE_BOTTOM
      ];

      this.visible = [
        z == 2 ? true  : false,
        x == 2 ? true  : false,
        z == 0 ? true  : false,
        x == 0 ? true  : false,
        y == 2 ? true  : false,
        y == 0 ? true  : false
      ]
    }

    this.offset = 1.0;
    this.rotX = 0.0;
    this.rotY = 0.0;
    this.rotZ = 0.0;

    this.cRot = 0;
  }

  getColorIndex(face) {
    return this.visible[face] ? this.colors[face] : Block.FACE_NONE;
  }

  getX() { return this.x; }
  getY() { return this.y; }
  getZ() { return this.z; }

  isCenter() {
    if ((this.x == 0 || this.x == 2) && this.y == 1 && this.z == 1) 
      return true;
    if ((this.y == 0 || this.y == 2) && this.x == 1 && this.z == 1) 
      return true;
    if ((this.z == 0 || this.z == 2) && this.x == 1 && this.y == 1) 
      return true;
    return false;
  }

  isEdge() {
    if ((this.x == 0 || this.x == 2) && (this.y == 0 || this.y == 2) && this.z == 1) 
      return true;
    if ((this.x == 0 || this.x == 2) && (this.z == 0 || this.z == 2) && this.y == 1) 
      return true;
    if ((this.y == 0 || this.y == 2) && (this.z == 0 || this.z == 2) && this.x == 1) 
      return true;
    return false;
  }

  isCorner() {
    if (
      (this.x == 0 || this.x == 2) && 
      (this.y == 0 || this.y == 2) && 
      (this.z == 0 || this.z == 2)
    )
      return true;
    return false;
  }

  hasColor(index) {
    for (let i = 0; i < 6; i ++) {
      if (!this.visible[i])
        continue;
      if (this.colors[i] == index)
        return true;
    }
    return false;
  }

  getFaceOfColor(index) {
    for (let i = 0; i < 6; i ++)
      if (this.visible[i] && this.colors[i] == index) 
        return i;
    return Block.FACE_NONE;
  }

  setDistanceFromCenter(dist) { this.offset = dist; }

  setXRot(rot) { this.rotX = rot; }
  setYRot(rot) { this.rotY = rot; }
  setZRot(rot) { this.rotZ = rot; }

  rotateX(right, spin = false) {
    let t = this.colors[Block.FACE_FRONT];
    let t2 = this.visible[Block.FACE_FRONT];
    let x1 = Math.floor(this.x) - 1;
    let z1 = Math.floor(this.z) - 1;
    
    if (right) {
      if (!spin) {
        this.x = 1 + z1; this.z = 1 - x1;
        this.visible[Block.FACE_FRONT] = this.visible[Block.FACE_LEFT];
        this.visible[Block.FACE_LEFT] = this.visible[Block.FACE_BACK];
        this.visible[Block.FACE_BACK] = this.visible[Block.FACE_RIGHT];
        this.visible[Block.FACE_RIGHT] = t2;
      }
      
      this.colors[Block.FACE_FRONT] = this.colors[Block.FACE_LEFT];
      this.colors[Block.FACE_LEFT] = this.colors[Block.FACE_BACK];
      this.colors[Block.FACE_BACK] = this.colors[Block.FACE_RIGHT];
      this.colors[Block.FACE_RIGHT] = t;
    } else {
      if (!spin) {
        this.x = 1 - z1; this.z = 1 + x1;
        this.visible[Block.FACE_FRONT] = this.visible[Block.FACE_RIGHT];
        this.visible[Block.FACE_RIGHT] = this.visible[Block.FACE_BACK];
        this.visible[Block.FACE_BACK] = this.visible[Block.FACE_LEFT];
        this.visible[Block.FACE_LEFT] = t2;
      }
      
      this.colors[Block.FACE_FRONT] = this.colors[Block.FACE_RIGHT];
      this.colors[Block.FACE_RIGHT] = this.colors[Block.FACE_BACK];
      this.colors[Block.FACE_BACK] = this.colors[Block.FACE_LEFT];
      this.colors[Block.FACE_LEFT] = t;
    }

    if (this.isCenter()) {
      if (this.y == (right ? 2 : 0)) this.cRot ++;
      if (this.y == (right ? 0 : 2)) this.cRot --;
    }
  }

  rotateY(down, spin = false) {
    let t = this.colors[0];
    let t2 = this.visible[0];
    
    let y1 = Math.floor(this.y) - 1;
    let z1 = Math.floor(this.z) - 1;
    if (down) {
      if (!spin) {
        this.z = 1 + y1; this.y = 1 - z1;
        this.visible[0] = this.visible[4];
        this.visible[4] = this.visible[2];
        this.visible[2] = this.visible[5];
        this.visible[5] = t2;
      }
      
      this.colors[0] = this.colors[4];
      this.colors[4] = this.colors[2];
      this.colors[2] = this.colors[5];
      this.colors[5] = t;
    } else {
      if (!spin) {
        this.z = 1 - y1; this.y = 1 + z1;
        this.visible[0] = this.visible[5];
        this.visible[5] = this.visible[2];
        this.visible[2] = this.visible[4];
        this.visible[4] = t2;
      }
      
      this.colors[0] = this.colors[5];
      this.colors[5] = this.colors[2];
      this.colors[2] = this.colors[4];
      this.colors[4] = t;
    }
    
    if (this.isCenter()) {
      if (this.x == (down ? 2 : 0)) this.cRot ++;
      if (this.x == (down ? 0 : 2)) this.cRot --;
      if (this.z == 0) this.cRot += 2;
      if (this.y == (down ? 2 : 0)) this.cRot += 2;
    }
  }

  rotateZ(clockwise, spin = false) {
    let t = this.colors[1];
    let t2 = this.visible[1];
    let x1 = this.x - 1;
    let y1 = this.y - 1;
    if (!clockwise) {
      if (!spin) {
        this.x = 1 - y1; this.y = 1 + x1;
        this.visible[1] = this.visible[5];
        this.visible[5] = this.visible[3];
        this.visible[3] = this.visible[4];
        this.visible[4] = t2;
      }
      
      this.colors[1] = this.colors[5];
      this.colors[5] = this.colors[3];
      this.colors[3] = this.colors[4];
      this.colors[4] = t;
    } else {
      if (!spin) {
        this.x = 1 + y1; this.y = 1 - x1;
        this.visible[1] = this.visible[4];
        this.visible[4] = this.visible[3];
        this.visible[3] = this.visible[5];
        this.visible[5] = t2;
      }
      
      this.colors[1] = this.colors[4];
      this.colors[4] = this.colors[3];
      this.colors[3] = this.colors[5];
      this.colors[5] = t;
    }
    
    if (this.isCenter()) {
      if (this.z == (clockwise ? 2 : 0)) this.cRot ++;
      if (this.z == (clockwise ? 0 : 2)) this.cRot --;
      if (this.x != 1 && clockwise) this.cRot ++;
      if (this.x != 1 && !clockwise) this.cRot --;
      if (this.y != 1 && clockwise) this.cRot ++;
      if (this.y != 1 && !clockwise) this.cRot --;
    }
  }

  draw(gl, programInfo, modelViewMatrix, selectMode = false) {
    let edit = this.offset != 1.0;
    
    let localMatrix = mat4.clone(modelViewMatrix);
    
    mat4.translate(localMatrix, localMatrix, [
      (this.x - 1.0) * this.offset, (this.y - 1.0) * this.offset, (this.z - 1.0) * this.offset
    ]);
    mat4.rotate(localMatrix, localMatrix, this.rotX, [1, 0, 0]);
    mat4.rotate(localMatrix, localMatrix, this.rotY, [0, 1, 0]);
    mat4.rotate(localMatrix, localMatrix, this.rotZ, [0, 0, 1]);

    // Not worrying with lighting yet
    /*let s_amd = [1.0, 1.0, 1.0, 1.0];
    let s_dif = [0.200000, 0.200000, 0.200000, 1.000000];
    let s_spc = [0.800000, 0.800000, 0.800000, 1.000000];
    let s_emi = [0.000000, 0.000000, 0.000000, 1.000000];
    glMaterialfv(GL_FRONT, GL_AMBIENT, s_amd);
    glMaterialfv(GL_FRONT, GL_DIFFUSE, s_dif);
    glMaterialfv(GL_FRONT, GL_SPECULAR, s_spc);
    glMateriali(GL_FRONT, GL_SHININESS, 120);
    glMaterialfv(GL_FRONT, GL_EMISSION, s_emi);*/
    
    gl.activeTexture(gl.TEXTURE0);
    if (selectMode)
      gl.bindTexture(gl.TEXTURE_2D, Block.textures.white);
    else
      gl.bindTexture(gl.TEXTURE_2D, Block.textures.block);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    
    for (let i = 0; i < 6; i ++)
    {
      let faceMatrix = mat4.clone(localMatrix);
      
      if (i == 1)
        mat4.rotate(faceMatrix, faceMatrix, 1.57079633, [0, 1, 0]);
      else if (i == 2)
        mat4.rotate(faceMatrix, faceMatrix, 3.14159265, [0, 1, 0]);
      else if (i == 3)
        mat4.rotate(faceMatrix, faceMatrix, 4.71238898, [0, 1, 0]);
      else if (i == 4)
        mat4.rotate(faceMatrix, faceMatrix, 4.71238898, [1, 0, 0]);
      else if (i == 5)
        mat4.rotate(faceMatrix, faceMatrix, 1.57079633, [1, 0, 0]);
      
      if (this.isCenter())
        mat4.rotate(faceMatrix, faceMatrix, 1.57079633 * this.cRot, [0, 0, 1]);

      gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix, false, faceMatrix
      );
      
      let cc = edit ? this.colors[i] : this.visible[i] ? this.colors[i] : 6;

      if (selectMode)
        gl.bindBuffer(gl.ARRAY_BUFFER, Block.buffers.positions[1]);
      else
        gl.bindBuffer(gl.ARRAY_BUFFER, Block.buffers.positions[0]);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3, gl.FLOAT,
        false, 0, 0
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, Block.buffers.textures[cc]);
      gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        2, gl.FLOAT,
        false, 0, 0
      );
      if (selectMode)
        gl.bindBuffer(gl.ARRAY_BUFFER, Block.buffers.colors[this.x][this.y][this.z][i]);
      else
        gl.bindBuffer(gl.ARRAY_BUFFER, Block.buffers.whiteColor);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexColor,
          4, gl.FLOAT,
          false, 0, 0
      );

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Block.buffers.indices);

      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
  }

  static encodeColor(x, y, z, f) {
    return [
      0.0,
      ((x * 10) + y) / 100.0,
      ((z * 10) + f) / 100.0,
      1.0
    ];
  }

  static decodeColor(color) {
    if (color[0] !== 0) return false;

    color[1] = Math.round(color[1] /255.0 * 100.0);
    color[2] = Math.round(color[2] /255.0 * 100.0);

    return [
      Math.floor(color[1] / 10),
      color[1] % 10,
      Math.floor(color[2] / 10),
      color[2] % 10
    ];
  }

  static initBuffers(gl) {
    // glNormal3f(0.0, 0.0, 1.0);

    const posBuffers = [
      gl.createBuffer(),
      gl.createBuffer()
    ];
    const positions = [[
       0.485,  0.485,  0.485,
      -0.485,  0.485,  0.485,
      -0.485, -0.485,  0.485,
       0.485, -0.485,  0.485
    ],[
       0.5,  0.5,  0.5,
      -0.5,  0.5,  0.5,
      -0.5, -0.5,  0.5,
       0.5, -0.5,  0.5,
    ]];
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffers[0]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions[0]), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffers[1]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions[1]), gl.STATIC_DRAW);

    const textureBuffers = [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const texBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);

      const texPos = [
        0, this.TEXTURE_SIZE * i,
        0, this.TEXTURE_SIZE * i + this.TEXTURE_SIZE,
        0.5, this.TEXTURE_SIZE * i + this.TEXTURE_SIZE,
        0.5, this.TEXTURE_SIZE * i
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texPos), gl.STATIC_DRAW);

      return texBuffer;
    });

    const colorBuffers = [0, 1, 2].map((x) => {
      return [0, 1, 2].map((y) => {
        return [0, 1, 2].map((z) => {
          return [0, 1, 2, 3, 4, 5].map((f) => {
            const color = Block.encodeColor(x, y, z, f);

            const colorPack = color.concat(color).concat(color).concat(color);

            const colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorPack), gl.STATIC_DRAW);
  
            return colorBuffer;
          });
        });
      });
    });

    const whiteColorBuffer = gl.createBuffer();
    const whiteColorPack = [
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, whiteColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(whiteColorPack), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [ 0, 1, 2,  0, 2, 3 ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    this.buffers = {
      positions: posBuffers,
      textures: textureBuffers,
      colors: colorBuffers,
      whiteColor: whiteColorBuffer,
      indices: indexBuffer
    };
  }

  static setTextures(textures) { this.textures = textures; }
}