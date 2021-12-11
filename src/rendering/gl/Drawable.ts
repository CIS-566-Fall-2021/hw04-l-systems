import {gl} from '../../globals';

abstract class Drawable {
  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufTranslate: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufUV: WebGLBuffer;
  bufT1: WebGLBuffer;
  bufT2: WebGLBuffer;
  bufT3: WebGLBuffer;
  bufT4: WebGLBuffer;

  idxGenerated: boolean = false;
  posGenerated: boolean = false;
  norGenerated: boolean = false;
  colGenerated: boolean = false;
  translateGenerated: boolean = false;
  uvGenerated: boolean = false;
  T1Generated: boolean = false;
  T2Generated: boolean = false;
  T3Generated: boolean = false;
  T4Generated: boolean = false;
  numInstances: number = 0; // How many instances of this Drawable the shader program should draw

  abstract create() : void;

  destory() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufNor);
    gl.deleteBuffer(this.bufCol);
    gl.deleteBuffer(this.bufTranslate);
    gl.deleteBuffer(this.bufUV);
    gl.deleteBuffer(this.bufT1);
    gl.deleteBuffer(this.bufT2);
    gl.deleteBuffer(this.bufT3);
    gl.deleteBuffer(this.bufT4);
  }

  generateIdx() {
    this.idxGenerated = true;
    this.bufIdx = gl.createBuffer();
  }

  generatePos() {
    this.posGenerated = true;
    this.bufPos = gl.createBuffer();
  }

  generateNor() {
    this.norGenerated = true;
    this.bufNor = gl.createBuffer();
  }

  generateCol() {
    this.colGenerated = true;
    this.bufCol = gl.createBuffer();
  }

  generateTranslate() {
    this.translateGenerated = true;
    this.bufTranslate = gl.createBuffer();
  }

  generateT1() {
    this.T1Generated = true;
    this.bufT1 = gl.createBuffer();
  }

  generateT2() {
    this.T2Generated = true;
    this.bufT2 = gl.createBuffer();
  }

  generateT3() {
    this.T3Generated = true;
    this.bufT3 = gl.createBuffer();
  }

  generateT4() {
    this.T4Generated = true;
    this.bufT4 = gl.createBuffer();
  }

  generateUV() {
    this.uvGenerated = true;
    this.bufUV = gl.createBuffer();
  }

  bindIdx(): boolean {
    if (this.idxGenerated) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    }
    return this.idxGenerated;
  }

  bindPos(): boolean {
    if (this.posGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    }
    return this.posGenerated;
  }

  bindNor(): boolean {
    if (this.norGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    }
    return this.norGenerated;
  }

  bindCol(): boolean {
    if (this.colGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    }
    return this.colGenerated;
  }

  bindTranslate(): boolean {
    if (this.translateGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    }
    return this.translateGenerated;
  }

  bindUV(): boolean {
    if (this.uvGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    }
    return this.uvGenerated;
  }

  bindT1(): boolean{
    if(this.T1Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufT1);
    }
    return this.T1Generated;
  }

  bindT2(): boolean{
    if(this.T2Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufT2);
    }
    return this.T2Generated;
  }

  bindT3(): boolean{
    if(this.T3Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufT3);
    }
    return this.T3Generated;
  }

  bindT4(): boolean{
    if(this.T4Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufT4);
    }
    return this.T4Generated;
  }

  elemCount(): number {
    return this.count;
  }

  drawMode(): GLenum {
    return gl.TRIANGLES;
  }

  setNumInstances(num: number) {
    this.numInstances = num;
  }
};

export default Drawable;
