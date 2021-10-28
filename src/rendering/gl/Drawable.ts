import {gl} from '../../globals';

abstract class Drawable {
  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufTranslate: WebGLBuffer;
  bufScale: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufUV: WebGLBuffer;

  bufMatCol0: WebGLBuffer;
  bufMatCol1: WebGLBuffer;
  bufMatCol2: WebGLBuffer;
  bufMatCol3: WebGLBuffer;



  idxGenerated: boolean = false;
  posGenerated: boolean = false;
  norGenerated: boolean = false;
  colGenerated: boolean = false;
  translateGenerated: boolean = false;
  scaleGenerated: boolean = false;
  uvGenerated: boolean = false;


  matCol0Generated: boolean = false;
  matCol1Generated: boolean = false;
  matCol2Generated: boolean = false;
  matCol3Generated: boolean = false;
  

  numInstances: number = 0; // How many instances of this Drawable the shader program should draw

  abstract create() : void;

  destroy() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufNor);
    gl.deleteBuffer(this.bufCol);
    gl.deleteBuffer(this.bufTranslate);
    gl.deleteBuffer(this.bufScale);
    gl.deleteBuffer(this.bufUV);


    gl.deleteBuffer(this.bufMatCol0);
    gl.deleteBuffer(this.bufMatCol1);
    gl.deleteBuffer(this.bufMatCol2);
    gl.deleteBuffer(this.bufMatCol3);

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

  generateScale() {
    this.scaleGenerated = true;
    this.bufScale = gl.createBuffer();
  }

  generateUV() {
    this.uvGenerated = true;
    this.bufUV = gl.createBuffer();
  }


  generateMatCol0() 
  {
    this.matCol0Generated = true;
    this.bufMatCol0 = gl.createBuffer();
  }

  generateMatCol1() 
  {
    this.matCol1Generated = true;
    this.bufMatCol1 = gl.createBuffer();
  }

  generateMatCol2() 
  {
    this.matCol2Generated = true;
    this.bufMatCol2 = gl.createBuffer();
  }

  generateMatCol3() 
  {
    this.matCol3Generated = true;
    this.bufMatCol3 = gl.createBuffer();
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


  bindScale(): boolean {
    if (this.scaleGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufScale);
    }
    return this.scaleGenerated;
  }


  bindUV(): boolean {
    if (this.uvGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    }
    return this.uvGenerated;
  }


  bindMatCol0(): boolean {
    if (this.matCol0Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufMatCol0);
    }
    return this.matCol0Generated;
  }


  bindMatCol1(): boolean {
    if (this.matCol1Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufMatCol1);
    }
    return this.matCol1Generated;
  }
  
  bindMatCol2(): boolean {
    if (this.matCol2Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufMatCol2);
    }
    return this.matCol2Generated;
  }

  bindMatCol3(): boolean {
    if (this.matCol3Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufMatCol3);
    }
    return this.matCol3Generated;
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
