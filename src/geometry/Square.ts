import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Square extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  transformCol0: Float32Array; // Data for first column of mat4 transform
  transformCol1: Float32Array; // Data for second column of mat4 transform
  transformCol2: Float32Array; // Data for third column of mat4 transform
  transformCol3: Float32Array; // Data for fourth column of mat4 transform

  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3]);
  this.positions = new Float32Array([-0.5, 0, -0.5, 1,
                                     0.5, 0, -0.5, 1,
                                     0.5, 0, 0.5, 1,
                                     -0.5, 0, 0.5, 1]);

    this.generateIdx();
    this.generatePos();
    this.generateCol();
    this.generateTransform0();
    this.generateTransform1();
    this.generateTransform2();
    this.generateTransform3();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created square`);
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

export default Square;
