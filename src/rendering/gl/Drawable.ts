import {gl} from '../../globals';

abstract class Drawable {
  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufTranslate: WebGLBuffer;
  bufTrans1: WebGLBuffer;
  bufTrans2: WebGLBuffer;
  bufTrans3: WebGLBuffer;
  bufTrans4: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufUV: WebGLBuffer;

  idxGenerated: boolean = false;
  posGenerated: boolean = false;
  norGenerated: boolean = false;
  colGenerated: boolean = false;
  translateGenerated: boolean = false;
  trans1Generated: boolean = false;
  trans2Generated: boolean = false;
  trans3Generated: boolean = false;
  trans4Generated: boolean = false;

  uvGenerated: boolean = false;

  numInstances: number = 0; // How many instances of this Drawable the shader program should draw

  abstract create() : void;

  destory() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufNor);
    gl.deleteBuffer(this.bufCol);
    gl.deleteBuffer(this.bufTranslate);
    gl.deleteBuffer(this.bufUV);
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

  generateTrans1() {
    this.trans1Generated = true;
    this.bufTrans1 = gl.createBuffer();
  }

  generateTrans2() {
    this.trans2Generated = true;
    this.bufTrans2 = gl.createBuffer();
  }

  generateTrans3() {
    this.trans3Generated = true;
    this.bufTrans3 = gl.createBuffer();
  }

  generateTrans4() {
    this.trans4Generated = true;
    this.bufTrans4 = gl.createBuffer();
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

  bindTrans1(): boolean {
    if (this.trans1Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTrans1);
    }

    return this.trans1Generated;
  }

  bindTrans2(): boolean {
    if (this.trans2Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTrans2);
    }

    return this.trans2Generated;
  }

  bindTrans3(): boolean {
    if (this.trans3Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTrans3);
    }

    return this.trans3Generated;
  }

  bindTrans4(): boolean {
    if (this.trans4Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTrans4);
    }

    return this.trans4Generated;
  }

  bindUV(): boolean {
    if (this.uvGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    }
    return this.uvGenerated;
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
