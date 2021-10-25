import {gl} from '../../globals';

abstract class Drawable {
  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufTranslate: WebGLBuffer;
  bufRotate: WebGLBuffer;
  bufScale: WebGLBuffer;

  bufTransformX: WebGLBuffer;
  bufTransformY: WebGLBuffer;
  bufTransformZ: WebGLBuffer;
  bufTransformW: WebGLBuffer;

  bufCol: WebGLBuffer;
  bufUV: WebGLBuffer;

  idxGenerated: boolean = false;
  posGenerated: boolean = false;
  norGenerated: boolean = false;
  colGenerated: boolean = false;
  translateGenerated: boolean = false;
  rotateGenerated: boolean = false;
  scaleGenerated: boolean = false;

  transformXGenerated: boolean = false;
  transformYGenerated: boolean = false;
  transformZGenerated: boolean = false;
  transformWGenerated: boolean = false;

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

  generateRotate() {
    this.rotateGenerated = true;
    this.bufRotate = gl.createBuffer();
  }

  generateScale() {
    this.scaleGenerated = true;
    this.bufScale = gl.createBuffer();
  }

  generateTransform() {
    this.generateTransformX();
    this.generateTransformY();
    this.generateTransformZ();
    this.generateTransformW();

  }

  generateTransformX() {
    this.transformXGenerated = true;
    this.bufTransformX = gl.createBuffer();
  }
  generateTransformY() {
    this.transformYGenerated = true;
    this.bufTransformY = gl.createBuffer();
  }

  generateTransformZ() {
    this.transformZGenerated = true;
    this.bufTransformZ = gl.createBuffer();
  }

  generateTransformW() {
    this.transformWGenerated = true;
    this.bufTransformW = gl.createBuffer();
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

  bindRotate(): boolean {
    if (this.rotateGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufRotate);
    }
    return this.rotateGenerated;
  }

  bindScale(): boolean {
    if (this.scaleGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufScale);
    }
    return this.scaleGenerated;
  }

  bindTransformX(): boolean {
    if (this.transformXGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformX);
    }
    return this.transformXGenerated;
  }

  bindTransformY(): boolean {
    if (this.transformYGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformY);
    }
    return this.transformYGenerated;
  }

  bindTransformZ(): boolean {
    if (this.transformZGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformZ);
    }
    return this.transformZGenerated;
  }

  bindTransformW(): boolean {
    if (this.transformWGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformW);
    }
    return this.transformWGenerated;
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
