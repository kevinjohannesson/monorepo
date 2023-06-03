import { assertNotNull } from "utils";

export const renderImage = (
  canvas: OffscreenCanvas,
  gl: WebGLRenderingContext,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  // const gl = canvas.getContext("webgl");

  // if (!gl) {
  //   alert("WebGL not supported");
  //   return;
  // }

  const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;

            varying vec2 v_texCoord;

            void main() {
                gl_Position = vec4(a_position, 0, 1);
                v_texCoord = a_texCoord;
            }
        `;

  const fragmentShaderSource = `
            precision mediump float;

            uniform sampler2D u_image;
            varying vec2 v_texCoord;

            void main() {
                gl_FragColor = texture2D(u_image, v_texCoord);
            }
        `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  assertNotNull(vertexShader);

  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  assertNotNull(fragmentShader);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  assertNotNull(program);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Convert coordinates from pixel space to clip space
  x = (x / canvas.width) * 2 - 1;
  y = (y / canvas.height) * 2 - 1;
  width = (width / canvas.width) * 2;
  height = (height / canvas.height) * 2;

  // Setup position buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      x,
      y,
      x + width,
      y,
      x,
      y + height,
      x,
      y + height,
      x + width,
      y,
      x + width,
      y + height,
    ]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
    gl.STATIC_DRAW
  );

  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // Create texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  const u_imageLocation = gl.getUniformLocation(program, "u_image");
  gl.uniform1i(u_imageLocation, 0);

  // Draw
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return () => {
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(texCoordBuffer);
    gl.deleteTexture(texture);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteProgram(program);
  };
};
