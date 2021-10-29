import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

class Instanced extends Drawable {
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
    this.generateTrans1();
    this.generateTrans2();
    this.generateTrans3();
    this.generateTrans4();
  }

  setInstanceVBOs(
    transMats: Array<mat4>,
    colors: Array<vec4>) {

    // Set up instanced rendering data arrays here.
    // This example creates a set of positional
    // offsets and gradiated colors for a 100x100 grid
    // of squares, even though the VBO data for just
    // one square is actually passed to the GPU
    let trans1Array:Array<number> = [];
    let trans2Array:Array<number>  = [];
    let trans3Array:Array<number>  = [];
    let trans4Array:Array<number>  = [];
    let colorsArray = [];

    for (let i = 0; i < transMats.length; i++) {
        let trans = transMats[i];
        let col = colors[i];
        trans1Array.push(trans[0]);
        trans1Array.push(trans[1]);
        trans1Array.push(trans[2]);
        trans1Array.push(trans[3]);

        trans2Array.push(trans[4]);
        trans2Array.push(trans[5]);
        trans2Array.push(trans[6]);
        trans2Array.push(trans[7]);

        trans3Array.push(trans[8]);
        trans3Array.push(trans[9]);
        trans3Array.push(trans[10]);
        trans3Array.push(trans[11]);

        trans4Array.push(trans[12]);
        trans4Array.push(trans[13]);
        trans4Array.push(trans[14]);
        trans4Array.push(trans[15]);

        colorsArray.push(col[0]);
        colorsArray.push(col[1]);
        colorsArray.push(col[2]);
        colorsArray.push(col[3]);
    }

    let colorFloats: Float32Array = new Float32Array(colorsArray);
    
    this.setNumInstances(transMats.length);

    this.colors = colorFloats;
    this.transCol1 = new Float32Array(trans1Array);
    this.transCol2 = new Float32Array(trans2Array);
    this.transCol3 = new Float32Array(trans3Array);
    this.transCol4 = new Float32Array(trans4Array);

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

export default Instanced;
