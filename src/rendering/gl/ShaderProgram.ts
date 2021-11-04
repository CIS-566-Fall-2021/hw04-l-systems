import {vec3, vec4, mat4, mat3} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number; // This time, it's an instanced rendering attribute, so each particle can have a unique color. Not per-vertex, but per-instance.
  attrTranslate: number; // Used in the vertex shader during instanced rendering to offset the vertex positions to the particle's drawn position.
  attrUV: number;
  attrId: number;

  attrTransform1: number;
  attrTransform2: number;
  attrTransform3: number;
  attrTransform4: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifCameraAxes: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifRef: WebGLUniformLocation;
  unifEye: WebGLUniformLocation;
  unifUp: WebGLUniformLocation;
  unifDimensions: WebGLUniformLocation;
  unifBarkTexture: WebGLUniformLocation;
  unifLeafTexture: WebGLUniformLocation;
  unifPotTexture: WebGLUniformLocation;

  barkTexture:WebGLUniformLocation;
  leafTexture:WebGLUniformLocation;
  potTexture:WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrId = gl.getAttribLocation(this.prog, "vs_Id");
    this.attrTranslate = gl.getAttribLocation(this.prog, "vs_Translate");
    this.attrUV = gl.getAttribLocation(this.prog, "vs_UV");
    this.attrTransform1 = gl.getAttribLocation(this.prog, "vs_Transform1");
    this.attrTransform2 = gl.getAttribLocation(this.prog, "vs_Transform2");
    this.attrTransform3 = gl.getAttribLocation(this.prog, "vs_Transform3");
    this.attrTransform4 = gl.getAttribLocation(this.prog, "vs_Transform4");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifCameraAxes      = gl.getUniformLocation(this.prog, "u_CameraAxes");
    this.unifTime      = gl.getUniformLocation(this.prog, "u_Time");
    this.unifEye   = gl.getUniformLocation(this.prog, "u_Eye");
    this.unifRef   = gl.getUniformLocation(this.prog, "u_Ref");
    this.unifUp   = gl.getUniformLocation(this.prog, "u_Up");

    // Textures
    this.unifBarkTexture     = gl.getUniformLocation(this.prog, "u_barkTexture");
    this.unifLeafTexture     = gl.getUniformLocation(this.prog, "u_leafTexture");
    this.unifPotTexture     = gl.getUniformLocation(this.prog, "u_potTexture");

  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  createTexture(url:string) {
    // setting up texture in OpenGL
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
    // Asynchronously load an image
    var image = new Image();
    image.src = url;
    image.crossOrigin = "anonymous";
  
    console.log(image.src);
    image.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
  
      // Check if the image is a power of 2 in both dimensions.
      if (ShaderProgram.isPowerOf2(image.width) && ShaderProgram.isPowerOf2(image.height)) {
         // Yes, it's a power of 2. Generate mips.
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    });
  
    return texture;
  
  }

  static isPowerOf2(value : number) {
    return (value & (value - 1)) === 0;
  }

  setTextures(textureMap: Map<number, string>) {
    this.use();
    this.barkTexture = this.createTexture(textureMap.get(0))
    this.leafTexture = this.createTexture(textureMap.get(1))
    this.potTexture = this.createTexture(textureMap.get(2))
    gl.uniform1i(this.unifBarkTexture, 0);
    gl.uniform1i(this.unifLeafTexture, 1);
    gl.uniform1i(this.unifPotTexture, 2);

  }

  setEyeRefUp(eye: vec3, ref: vec3, up: vec3) {
    this.use();
    if(this.unifEye !== -1) {
      gl.uniform3f(this.unifEye, eye[0], eye[1], eye[2]);
    }
    if(this.unifRef !== -1) {
      gl.uniform3f(this.unifRef, ref[0], ref[1], ref[2]);
    }
    if(this.unifUp !== -1) {
      gl.uniform3f(this.unifUp, up[0], up[1], up[2]);
    }
  }

  setDimensions(width: number, height: number) {
    this.use();
    if(this.unifDimensions !== -1) {
      gl.uniform2f(this.unifDimensions, width, height);
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setCameraAxes(axes: mat3) {
    this.use();
    if (this.unifCameraAxes !== -1) {
      gl.uniformMatrix3fv(this.unifCameraAxes, false, axes);
    }
  }

  setTime(t: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, t);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrNor, 0); // Advance 1 index in nor VBO for each vertex
    }

    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrCol, 1); // Advance 1 index in col VBO for each drawn instance
    }

    if (this.attrTranslate != -1 && d.bindTranslate()) {
      gl.enableVertexAttribArray(this.attrTranslate);
      gl.vertexAttribPointer(this.attrTranslate, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTranslate, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrUV, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrId != -1 && d.bindId()) {
      gl.enableVertexAttribArray(this.attrId);
      gl.vertexAttribPointer(this.attrId, 2, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrId, 0); // Advance 1 index in pos VBO for each vertex
    }

    // TODO: Set up attribute data for additional instanced rendering data as needed

    if (this.attrTransform1 != -1 && d.bindTransform1()) {
      gl.enableVertexAttribArray(this.attrTransform1);
      gl.vertexAttribPointer(this.attrTransform1, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransform1, 1); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrTransform2 != -1 && d.bindTransform2()) {
      gl.enableVertexAttribArray(this.attrTransform2);
      gl.vertexAttribPointer(this.attrTransform2, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransform2, 1); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrTransform3 != -1 && d.bindTransform3()) {
      gl.enableVertexAttribArray(this.attrTransform3);
      gl.vertexAttribPointer(this.attrTransform3, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransform3, 1); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrTransform4 != -1 && d.bindTransform4()) {
      gl.enableVertexAttribArray(this.attrTransform4);
      gl.vertexAttribPointer(this.attrTransform4, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransform4, 1); // Advance 1 index in pos VBO for each vertex
    }

    if (this.unifBarkTexture != -1) {
      gl.activeTexture(gl.TEXTURE0); //GL supports up to 32 different active textures at once(0 - 31)
      gl.bindTexture(gl.TEXTURE_2D, this.barkTexture);
      gl.uniform1i(this.unifBarkTexture, 0);
    }

    if (this.unifLeafTexture != -1) {
      gl.activeTexture(gl.TEXTURE1); //GL supports up to 32 different active textures at once(0 - 31)
      gl.bindTexture(gl.TEXTURE_2D, this.leafTexture);
      gl.uniform1i(this.unifLeafTexture, 1);
    }

    if (this.unifPotTexture != -1) {
      gl.activeTexture(gl.TEXTURE2); //GL supports up to 32 different active textures at once(0 - 31)
      gl.bindTexture(gl.TEXTURE_2D, this.potTexture);
      gl.uniform1i(this.unifPotTexture, 2);
    }

    d.bindIdx();
    // drawElementsInstanced uses the vertexAttribDivisor for each "in" variable to
    // determine how to link it to each drawn instance of the bound VBO.
    // For example, the index used to look in the VBO associated with
    // vs_Pos (attrPos) is advanced by 1 for each thread of the GPU running the
    // vertex shader since its divisor is 0.
    // On the other hand, the index used to look in the VBO associated with
    // vs_Translate (attrTranslate) is advanced by 1 only when the next instance
    // of our drawn object (in the base code example, the square) is processed
    // by the GPU, thus being the same value for the first set of four vertices,
    // then advancing to a new value for the next four, then the next four, and
    // so on.
    gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, d.numInstances);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrId != -1) gl.disableVertexAttribArray(this.attrId);
    if (this.attrTranslate != -1) gl.disableVertexAttribArray(this.attrTranslate);
    if (this.attrUV != -1) gl.disableVertexAttribArray(this.attrUV);
    if (this.attrTransform1 != -1) gl.disableVertexAttribArray(this.attrTransform1);
    if (this.attrTransform2 != -1) gl.disableVertexAttribArray(this.attrTransform2);
    if (this.attrTransform3 != -1) gl.disableVertexAttribArray(this.attrTransform3);
    if (this.attrTransform4 != -1) gl.disableVertexAttribArray(this.attrTransform4);
  }
};

export default ShaderProgram;
