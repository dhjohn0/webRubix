// Vertex shader program
const VS_SOURCE = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vTextureCoord = aTextureCoord;
  vColor = aVertexColor;
}
`;

// Fragment shader program
const FS_SOURCE = `
varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;

uniform sampler2D uSampler;

void main(void) {
  gl_FragColor = texture2D(uSampler, vTextureCoord) + vColor;
}
`;

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export default class GlWindow {
  constructor(canvas) {
    this.canvas = canvas;

    this.gl = canvas.getContext('webgl');
    this.resize();
    window.onresize = this.resize;
    canvas.onmousedown = this.onMouseDown;
    canvas.onmouseup = this.onMouseUp;
    canvas.onmousemove = this.onMouseMove;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(this.gl, VS_SOURCE, FS_SOURCE);

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aTextureCoord and also
    // look up uniform locations.
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: this.gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        vertexColor: this.gl.getAttribLocation(shaderProgram, 'aVertexColor')
      },
      uniformLocations: {
        projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        uSampler: this.gl.getUniformLocation(shaderProgram, 'uSampler'),
      },
    };
    this.gl.useProgram(this.programInfo.program);

    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);

    this.setClearColor([0.0, 0.0, 0.0, 1.0]);

    this.gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.enable(this.gl.BLEND);
    //this.gl.blendFunc(this.gl.GL_SRC_ALPHA, this.gl.GL_ONE_MINUS_SRC_ALPHA);

    // Draw the scene repeatedly
    const render = (now) => {
      if (typeof(this.draw) === 'function') {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.draw(this.gl, this.programInfo, now);
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  setClearColor(color) { 
    this.gl.clearColor(color[0], color[1], color[2], color[3]); 
  }

  resize = () => {
    this.canvas.width = $(this.canvas).parent().width();
    this.canvas.height = window.innerHeight - 15;

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  onMouseDown = (e) => {
    if (this.mouseDown)
      return this.mouseDown(e);
  }
  onMouseUp = (e) => {
    if (this.mouseUp)
      return this.mouseUp(e);
  }
  onMouseMove = (e) => {
    if (this.mouseMove)
      return this.mouseMove(e);
  }

  setRender(draw) { this.draw = draw; }

  setMouseDown(callback) { this.mouseDown = callback; }
  setMouseUp(callback) { this.mouseUp = callback; }
  setMouseMove(callback) { this.mouseMove = callback; }

  loadTexture(url) {
    function isPowerOf2(value) {
      return (value & (value - 1)) == 0;
    }
    
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  
    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = this.gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = this.gl.RGBA;
    const srcType = this.gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  
    const image = new Image();
    image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);
  
      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
         // Yes, it's a power of 2. Generate mips.
         this.gl.generateMipmap(this.gl.TEXTURE_2D);
      } else {
         // No, it's not a power of 2. Turn of mips and set
         // wrapping to clamp to edge
         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      }
    };
    image.src = url;
    return texture;
  }

}