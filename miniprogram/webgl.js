function initWebgl(gl) {
  let vertices = new Float32Array([
    -1,  1, 0, 1,
    -1, -1, 0, 0,
     1,  1, 1, 1,
     1, -1, 1, 0
  ])
  let indices = [0, 1, 2, 2, 1, 3]

  let vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  let indicesBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  let vertexSource = `
    attribute vec2 a_Position;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;

    void main() {
      gl_Position = vec4(a_Position, 1.0, 1.0);
      v_TexCoord = a_TexCoord;
    }
  `
  let frameSource = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_TexCoord;

    void main() {
      gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    }
  `

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, frameSource)
  let program = createProgram(gl, vertexShader, fragmentShader)

  const SIZE = vertices.BYTES_PER_ELEMENT
  let a_Position = gl.getAttribLocation(program, 'a_Position')
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, SIZE * 4, 0)
  gl.enableVertexAttribArray(a_Position)

  let a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord')
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, SIZE * 4, SIZE * 2)
  gl.enableVertexAttribArray(a_TexCoord)
  
  let texture = gl.createTexture()
  let u_Sampler = gl.getUniformLocation(program, 'u_Sampler')

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.uniform1i(u_Sampler, 0)

  function createShader(gl, type, source) {
    let shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error compiling shader: ' + gl.getShaderInfoLog(shader))
    }
    return shader
  }

  function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program.')
      return
    }

    gl.useProgram(program)

    return program
  }

  function render(gl, image, width, height) {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.drawElements(gl.TRIANGLE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0)
  }

  return render
}

module.exports = initWebgl