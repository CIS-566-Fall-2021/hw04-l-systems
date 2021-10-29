import {vec3, vec4} from 'gl-matrix';
import {gl} from '../globals';
import Instanced from '../rendering/gl/Instanced';

class Square extends Instanced {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  normals: Float32Array;
  transCol1: Float32Array;
  transCol2: Float32Array;
  transCol3: Float32Array;
  transCol4: Float32Array;


  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {

    this.indices = new Uint32Array([
      0, 1, 2,
      0, 2, 3,

      4, 5, 6,
      4, 6, 7,

      8, 9, 10,
      8, 10, 11,

      12, 13, 14,
      12, 14, 15,

      16, 17, 18,
      16, 18, 19,

      20, 21, 22,
      20, 22, 23]);

    this.normals = new Float32Array(
      [0, 0, 1, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,

        0, 0, -1, 0,
        0, 0, -1, 0,
        0, 0, -1, 0,
        0, 0, -1, 0,

        1, 0, 0, 0,
        1, 0, 0, 0,
        1, 0, 0, 0,
        1, 0, 0, 0,

        -1, 0, 0, 0,
        -1, 0, 0, 0,
        -1, 0, 0, 0,
        -1, 0, 0, 0,

        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,

        0, -1, 0, 0,
        0, -1, 0, 0,
        0, -1, 0, 0,
        0, -1, 0, 0]);

    this.positions = new Float32Array([
        -0.5, 0, 0.5, 1,
        0.5, 0, 0.5, 1,
        0.5, 1, 0.5, 1,
        -0.5, 1, 0.5, 1,
    
        -0.5, 0, -0.5, 1,
        0.5, 0, -0.5, 1,
        0.5, 1, -0.5, 1,
        -0.5, 1, -0.5, 1,
    
        0.5, 0, -0.5, 1,
        0.5, 1, -0.5, 1,
        0.5, 1, 0.5, 1,
        0.5, 0, 0.5, 1,
    
        -0.5, 0, -0.5, 1,
        -0.5, 1, -0.5, 1,
        -0.5, 1, 0.5, 1,
        -0.5, 0, 0.5, 1,
    
        -0.5, 1, -0.5, 1,
        0.5, 1, -0.5, 1,
        0.5, 1, 0.5, 1,
        -0.5, 1, 0.5, 1,
    
        -0.5, 0, -0.5, 1,
        0.5, 0, -0.5, 1,
        0.5, 0, 0.5, 1,
        -0.5, 0, 0.5, 1]);

    this.generateIdx();
    this.generatePos();
    this.generateCol();
    this.generateNor();
    super.create();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created square`);
  }
};

export default Square;
