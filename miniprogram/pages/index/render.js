function createShaderFromScript(gl, type, source) {
  var shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  } else {
    console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  return program
}

export function initGl(gl) {
  const canvas = gl.canvas
  const vertexShaderSource = `
    precision mediump float;
    attribute vec2 a_Position;
    attribute vec2 a_Screen_Size;
    attribute vec4 a_Uv;
    varying vec4 v_Uv;

    void main() {
      vec2 position = (a_Position / a_Screen_Size) * 2.0 - 1.0;
      position = position * vec2(1.0, -1.0);
      gl_Position = vec4(position, 0.0, 1.0);
      gl_PointSize = 10.0;
      v_Uv = a_Uv;
    }
  `
  const fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_Uv;
    uniform sampler2D u_Texture;

    void main() {
      gl_FragColor = texture2D(u_Texture, vec2(v_Uv.x, v_Uv.y));
    }
  `
  let vertexShader = createShaderFromScript(gl, gl.VERTEX_SHADER, vertexShaderSource)
  let fragmentShader = createShaderFromScript(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  let program = createProgram(gl, vertexShader, fragmentShader)
  gl.useProgram(program)

  let a_Screen_Size = gl.getAttribLocation(program, 'a_Screen_Size')
  gl.vertexAttrib2f(a_Screen_Size, canvas.width, canvas.height)

  let u_Texture = gl.getUniformLocation(program, 'u_Texture')
  let a_Position = gl.getAttribLocation(program, 'a_Position')
  let a_Uv = gl.getAttribLocation(program, 'a_Uv')
  gl.enableVertexAttribArray(a_Position)
  gl.enableVertexAttribArray(a_Uv)

  let buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 16, 0)
  gl.vertexAttribPointer(a_Uv, 2, gl.FLOAT, false, 16, 8)

  let positions = [
    0, 0, 0, 0,
    0, canvas.height, 0, 1,
    canvas.width, canvas.height, 1, 1,
    0, 0, 0, 0,
    canvas.width, canvas.height, 1, 1,
    canvas.width, 0, 1, 0
  ]

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  let texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.uniform1i(u_Texture, 0)
}

export function render(gl, img) {
  const canvas = gl.canvas
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.activeTexture(gl.TEXTURE0)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img, 0)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}