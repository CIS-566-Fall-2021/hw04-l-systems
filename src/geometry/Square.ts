import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Square extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
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

  this.positions = new Float32Array([
      -1, -1, 1, 1,
      1, -1, 1, 1,
      1, 1, 1, 1,
      -1, 1, 1, 1,

      -1, -1, -1, 1,
      1, -1, -1, 1,
      1, 1, -1, 1,
      -1, 1, -1, 1,

      1, -1, -1, 1,
      1, 1, -1, 1,
      1, 1, 1, 1,
      1, -1, 1, 1,

      -1, -1, -1, 1,
      -1, 1, -1, 1,
      -1, 1, 1, 1,
      -1, -1, 1, 1,

      -1, 1, -1, 1,
      1, 1, -1, 1,
      1, 1, 1, 1,
      -1, 1, 1, 1,

      -1, -1, -1, 1,
      1, -1, -1, 1,
      1, -1, 1, 1,
      -1, -1, 1, 1]);

  for (let i = 0; i < this.positions.length; i += 4) {
      this.positions[i] = (this.positions[i] / 2);
      if (i - (Math.floor(i / 4) * 4) === 1) {
        this.positions[i] += 0.5;
      }
  }

    this.generateIdx();
    this.generatePos();
    this.generateCol();
    this.generateTrans1();
    this.generateTrans2();
    this.generateTrans3();
    this.generateTrans4();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created square`);
  }

  setInstanceVBOs(
    transCol1: Float32Array,
    transCol2: Float32Array,
    transCol3: Float32Array,
    transCol4: Float32Array,
    colors: Float32Array) {
    this.colors = colors;
    this.transCol1 = transCol1;
    this.transCol2 = transCol2;
    this.transCol3 = transCol3;
    this.transCol4 = transCol4;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    if (!this.bindTrans1()) {
      console.error("1st trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol1, gl.STATIC_DRAW);

    if (!this.bindTrans2()) {
      console.error("2nd trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol2, gl.STATIC_DRAW);

    if (!this.bindTrans3()) {
      console.error("3rd trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol3, gl.STATIC_DRAW);

    if (!this.bindTrans4()) {
      console.error("4th trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol4, gl.STATIC_DRAW);
  }
};

export default Square;
