
import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  offsets: Float32Array; // Data for bufTranslate

  normals: Float32Array;

  matCol0: Float32Array;
  matCol1: Float32Array;
  matCol2: Float32Array;
  matCol3: Float32Array;



  center: vec4;

  constructor() 
  {
      super(); // Call the constructor of the super class.
      this.center = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
  }

  create() 
  {
      // Positions array
      this.positions = new Float32Array([
        // First Face
        -1 + this.center[0], -1 + this.center[1], 1 + this.center[2], 1,
        1 + this.center[0], -1 + this.center[1], 1 + this.center[2], 1,
        1 + this.center[0], 1 + this.center[1], 1 + this.center[2], 1,
        -1 + this.center[0], 1 + this.center[1], 1 + this.center[2], 1,
  
        // Second Face
        -1 + this.center[0], -1 + this.center[1], -1 + this.center[2], 1,
        1 + this.center[0], -1 + this.center[1], -1 + this.center[2], 1,
        1 + this.center[0], 1 + this.center[1], -1 + this.center[2], 1,
        -1 + this.center[0], 1 + this.center[1], -1 + this.center[2], 1,
  
        // Third Face
        1 + this.center[0], -1 + this.center[1], 1 + this.center[2], 1,
        1 + this.center[0], -1 + this.center[1], -1 + this.center[2], 1,
        1 + this.center[0], 1 + this.center[1], -1 + this.center[2], 1,
        1 + this.center[0], 1 + this.center[1], 1 + this.center[2], 1,
  
        // Fourth Face
        -1 + this.center[0], -1 + this.center[1], 1 + this.center[2], 1,
        -1 + this.center[0], -1 + this.center[1], -1 + this.center[2], 1,
        -1 + this.center[0], 1 + this.center[1], -1 + this.center[2], 1,
        -1 + this.center[0], 1 + this.center[1], 1 + this.center[2], 1,
  
        // Fifth Face
        -1 + this.center[0], -1 + this.center[1], 1 + this.center[2], 1,
        1 + this.center[0], -1 + this.center[1], 1 + this.center[2], 1,
        1 + this.center[0], -1 + this.center[1], -1 + this.center[2], 1,
        -1 + this.center[0], -1 + this.center[1], -1 + this.center[2], 1,
  
        // Sixth Face
        -1 + this.center[0], 1 + this.center[1], 1 + this.center[2], 1,
        1 + this.center[0], 1 + this.center[1], 1 + this.center[2], 1,
        1 + this.center[0], 1 + this.center[1], -1 + this.center[2], 1,
        -1 + this.center[0], 1 + this.center[1], -1 + this.center[2], 1
      ]);

      // Indices array
    this.indices = new Uint32Array([
        // First Face
        0, 1, 2, 0, 2, 3, 
  
        // Second Face
        4, 5, 6, 4, 6, 7,
  
        // Third Face
        8, 9, 10, 8, 10, 11, 
  
        // Fourth Face
        12, 13, 14, 12, 14, 15,
  
        // Fifth Face
        16, 17, 18, 16, 18, 19, 
  
        // Sixth Face
        20, 21, 22, 20, 22, 23
      ]);
  

      // Normals array
    this.normals = new Float32Array([
        // First Face
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,
  
        // Second Face
        0, 0, -1, 0,
        0, 0, -1, 0,
        0, 0, -1, 0,
        0, 0, -1, 0,
  
        // Third Face
        1, 0, 0, 0,
        1, 0, 0, 0,
        1, 0, 0, 0,
        1, 0, 0, 0,
  
        // Fourth Face
        -1, 0, 0, 0,
        -1, 0, 0, 0,
        -1, 0, 0, 0,
        -1, 0, 0, 0,
  
        // Fifth Face
        0, -1, 0, 0,
        0, -1, 0, 0,
        0, -1, 0, 0,
        0, -1, 0, 0,
  
        // Sixth Face
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0
      ]);


    this.generateIdx();
    this.generatePos();
    this.generateCol();

    this.generateNor();

    this.generateTranslate();

    this.generateMatCol0();
    this.generateMatCol1();
    this.generateMatCol2();
    this.generateMatCol3();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);


    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created Cube`);
  }

  setInstanceVBOs(offsets: Float32Array, 
                  colors: Float32Array,
                  matCol0In: Float32Array,
                  matCol1In: Float32Array,
                  matCol2In: Float32Array,
                  matCol3In: Float32Array) 
  {
    this.colors = colors;
    this.offsets = offsets;

    this.matCol0 = matCol0In;
    this.matCol1 = matCol1In;
    this.matCol2 = matCol2In;
    this.matCol3 = matCol3In;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufMatCol0);
    gl.bufferData(gl.ARRAY_BUFFER, this.matCol0, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufMatCol1);
    gl.bufferData(gl.ARRAY_BUFFER, this.matCol1, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufMatCol2);
    gl.bufferData(gl.ARRAY_BUFFER, this.matCol2, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufMatCol3);
    gl.bufferData(gl.ARRAY_BUFFER, this.matCol3, gl.STATIC_DRAW);
  }
};

export default Cube;
