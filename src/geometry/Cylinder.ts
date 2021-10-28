import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cylinder extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  transformCol0: Float32Array; // Data for first column of mat4 transform
  transformCol1: Float32Array; // Data for second column of mat4 transform
  transformCol2: Float32Array; // Data for third column of mat4 transform
  transformCol3: Float32Array; // Data for fourth column of mat4 transform
  normals: Float32Array;

  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3,
                                  0, 3, 4,
                                  0, 4, 5,
                                  0, 5, 6,
                                  0, 6, 7,
                                  0, 7, 8,
                                  0, 8, 9,
                                  0, 9, 10,
                                  0, 10, 11,
                                  0, 11, 12,
                                  0, 12, 13,
                                  0, 13, 14,
                                  0, 14, 15,

                                  16, 17, 18,
                                  16, 18, 19,
                                  16, 19, 20,
                                  16, 20, 21,
                                  16, 21, 22,
                                  16, 22, 23,
                                  16, 23, 24,
                                  16, 24, 25,
                                  16, 25, 26,
                                  16, 26, 27,
                                  16, 27, 28,
                                  16, 28, 29,
                                  16, 29, 30,
                                  16, 30, 31,

                                  32, 33, 34,
                                  33, 34, 35,
                                  33, 36, 35,
                                  36, 35, 37,
                                  36, 38, 37,
                                  38, 37, 39,
                                  38, 40, 39,
                                  40, 39, 41,
                                  40, 42, 41,
                                  42, 41, 43,
                                  42, 44, 43,
                                  44, 43, 45,
                                  44, 46, 45,
                                  46, 45, 47,
                                  46, 48, 47,
                                  48, 47, 49,
                                  48, 50, 49,
                                  50, 49, 51,
                                  50, 52, 51,
                                  52, 51, 53, 
                                  52, 54, 53,
                                  54, 53, 55,
                                  54, 56, 55,
                                  56, 55, 57,
                                  56, 58, 57,
                                  58, 57, 59,
                                  58, 60, 59,
                                  60, 59, 61,
                                  60, 62, 61,
                                  62, 61, 63,
                                  62, 32, 63,
                                  32, 63, 34
                                ]);
  this.positions = new Float32Array([
                                    // CIRCLE 1
                                     1, 0, 0, 1,                            // 0 degrees
                                     0.92387953251, 0, 0.38268343236, 1,    // 22.5 degrees
                                     0.70710678118, 0, 0.70710678118, 1,    // 45 degrees
                                     0.38268343236, 0, 0.92387953251, 1,    // 67.5 degrees
                                     0, 0, 1, 1,                            // 90 degrees
                                     -0.38268343236, 0, 0.92387953251, 1,   // 112.5 degrees
                                     -0.70710678118, 0, 0.70710678118, 1,   // 135 degrees
                                     -0.92387953251, 0, 0.38268343236, 1,   // 157.5 degrees
                                     -1, 0, 0, 1,                           // 180 degrees
                                     -0.92387953251, 0, -0.38268343236, 1,  // 202.5 degrees
                                     -0.70710678118, 0, -0.70710678118, 1,  // 225 degrees
                                     -0.38268343236, 0, -0.92387953251, 1,  // 247.5 degrees
                                     0, 0, -1, 1,                           // 270 degrees
                                     0.38268343236, 0, -0.92387953251, 1,   // 292.5 degrees
                                     0.70710678118, 0, -0.70710678118, 1,   // 315 degrees
                                     0.92387953251, 0, -0.38268343236, 1,   // 337.5 degrees
                                    // CIRCLE 2
                                     1, 1, 0, 1,                            // 0 degrees
                                     0.92387953251, 1, 0.38268343236, 1,    // 22.5 degrees
                                     0.70710678118, 1, 0.70710678118, 1,    // 45 degrees
                                     0.38268343236, 1, 0.92387953251, 1,    // 67.5 degrees
                                     0, 1, 1, 1,                            // 90 degrees
                                     -0.38268343236, 1, 0.92387953251, 1,   // 112.5 degrees
                                     -0.70710678118, 1, 0.70710678118, 1,   // 135 degrees
                                     -0.92387953251, 1, 0.38268343236, 1,   // 157.5 degrees
                                     -1, 1, 0, 1,                           // 180 degrees
                                     -0.92387953251, 1, -0.38268343236, 1,  // 202.5 degrees
                                     -0.70710678118, 1, -0.70710678118, 1,  // 225 degrees
                                     -0.38268343236, 1, -0.92387953251, 1,  // 247.5 degrees
                                     0, 1, -1, 1,                           // 270 degrees
                                     0.38268343236, 1, -0.92387953251, 1,   // 292.5 degrees
                                     0.70710678118, 1, -0.70710678118, 1,   // 315 degrees
                                     0.92387953251, 1, -0.38268343236, 1,   // 337.5 degrees
                                     // SIDE
                                     1, 0, 0, 1,                            // 0
                                     0.92387953251, 0, 0.38268343236, 1,    // 1
                                     1, 1, 0, 1,                            // 16
                                     0.92387953251, 1, 0.38268343236, 1,    // 17
                                     0.70710678118, 0, 0.70710678118, 1,    // 2
                                     0.70710678118, 1, 0.70710678118, 1,    // 18
                                     0.38268343236, 0, 0.92387953251, 1,    // 3
                                     0.38268343236, 1, 0.92387953251, 1,    // 19
                                     0, 0, 1, 1,                            // 4
                                     0, 1, 1, 1,                            // 20
                                     -0.38268343236, 0, 0.92387953251, 1,   // 5
                                     -0.38268343236, 1, 0.92387953251, 1,   // 21
                                     -0.70710678118, 0, 0.70710678118, 1,   // 6
                                     -0.70710678118, 1, 0.70710678118, 1,   // 22
                                     -0.92387953251, 0, 0.38268343236, 1,   // 7
                                     -0.92387953251, 1, 0.38268343236, 1,   // 23
                                     -1, 0, 0, 1,                           // 8
                                     -1, 1, 0, 1,                           // 24
                                     -0.92387953251, 0, -0.38268343236, 1,  // 9
                                     -0.92387953251, 1, -0.38268343236, 1,  // 25
                                     -0.70710678118, 0, -0.70710678118, 1,  // 10
                                     -0.70710678118, 1, -0.70710678118, 1,  // 26
                                     -0.38268343236, 0, -0.92387953251, 1,  // 11
                                     -0.38268343236, 1, -0.92387953251, 1,  // 27
                                     0, 0, -1, 1,                           // 12
                                     0, 1, -1, 1,                           // 28
                                     0.38268343236, 0, -0.92387953251, 1,   // 13
                                     0.38268343236, 1, -0.92387953251, 1,   // 29
                                     0.70710678118, 0, -0.70710678118, 1,   // 14
                                     0.70710678118, 1, -0.70710678118, 1,   // 30
                                     0.92387953251, 0, -0.38268343236, 1,   // 15
                                     0.92387953251, 1, -0.38268343236, 1,   // 31
  ]);

  this.normals = new Float32Array([
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    1, 0, 0, 0,
    0.92387953251, 0, 0.38268343236, 1,    // 1
                                     1, 1, 0, 1,                            // 16
                                     0.92387953251, 1, 0.38268343236, 1,    // 17
                                     0.70710678118, 0, 0.70710678118, 1,    // 2
                                     0.70710678118, 1, 0.70710678118, 1,    // 18
                                     0.38268343236, 0, 0.92387953251, 1,    // 3
                                     0.38268343236, 1, 0.92387953251, 1,    // 19
                                     0, 0, 1, 1,                            // 4
                                     0, 1, 1, 1,                            // 20
                                     -0.38268343236, 0, 0.92387953251, 1,   // 5
                                     -0.38268343236, 1, 0.92387953251, 1,   // 21
                                     -0.70710678118, 0, 0.70710678118, 1,   // 6
                                     -0.70710678118, 1, 0.70710678118, 1,   // 22
                                     -0.92387953251, 0, 0.38268343236, 1,   // 7
                                     -0.92387953251, 1, 0.38268343236, 1,   // 23
                                     -1, 0, 0, 1,                           // 8
                                     -1, 1, 0, 1,                           // 24
                                     -0.92387953251, 0, -0.38268343236, 1,  // 9
                                     -0.92387953251, 1, -0.38268343236, 1,  // 25
                                     -0.70710678118, 0, -0.70710678118, 1,  // 10
                                     -0.70710678118, 1, -0.70710678118, 1,  // 26
                                     -0.38268343236, 0, -0.92387953251, 1,  // 11
                                     -0.38268343236, 1, -0.92387953251, 1,  // 27
                                     0, 0, -1, 1,                           // 12
                                     0, 1, -1, 1,                           // 28
                                     0.38268343236, 0, -0.92387953251, 1,   // 13
                                     0.38268343236, 1, -0.92387953251, 1,   // 29
                                     0.70710678118, 0, -0.70710678118, 1,   // 14
                                     0.70710678118, 1, -0.70710678118, 1,   // 30
                                     0.92387953251, 0, -0.38268343236, 1,   // 15
                                     0.92387953251, 1, -0.38268343236, 1,   // 31
  ]);

    this.generateIdx();
    this.generatePos();
    this.generateCol();
    this.generateNor();
    this.generateTransform0();
    this.generateTransform1();
    this.generateTransform2();
    this.generateTransform3();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    console.log(`Created cylinder`);
  }

  setInstanceVBOs(col0: Float32Array, col1: Float32Array, 
                  col2: Float32Array, col3: Float32Array, colors: Float32Array) {
    this.colors = colors;
    this.transformCol0 = col0;
    this.transformCol1 = col1;
    this.transformCol2 = col2;
    this.transformCol3 = col3;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform0);
    gl.bufferData(gl.ARRAY_BUFFER, this.transformCol0, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform1);
    gl.bufferData(gl.ARRAY_BUFFER, this.transformCol1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform2);
    gl.bufferData(gl.ARRAY_BUFFER, this.transformCol2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform3);
    gl.bufferData(gl.ARRAY_BUFFER, this.transformCol3, gl.STATIC_DRAW);
  }
};

export default Cylinder;
