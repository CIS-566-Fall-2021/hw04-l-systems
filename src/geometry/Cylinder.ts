
import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

const root2: number = 1.41421346;

class Cylinder extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  offsets: Float32Array; // Data for bufTranslate

  scale: Float32Array;

  normals: Float32Array;

  matCol0: Float32Array;
  matCol1: Float32Array;
  matCol2: Float32Array;
  matCol3: Float32Array;

  height: number;

  constructor(height: number) 
  {
      super(); // Call the constructor of the super class.
      this.height = height;
  }

  create() 
  {
      // Positions array
      this.positions = new Float32Array([

        // Bottom
        1, 0, 1, 1,
        root2, 0, 0, 1,
        1, 0, -1, 1,
        0, 0, -root2, 1,
        -1, 0, -1, 1,
        -root2, 0, 0, 1,
        -1, 0, 1, 1,
        0, 0, root2, 1,

        // Top
        1, this.height, 1, 1,
        root2, this.height, 0, 1,
        1, this.height, -1, 1,
        0, this.height, -root2, 1,
        -1, this.height, -1, 1,
        -root2, this.height, 0, 1,
        -1, this.height, 1, 1,
        0, this.height, root2, 1,
      ]);

      // Indices array
    this.indices = new Uint32Array([
        // Rectangles
        0, 1, 9,
        0, 9, 8,
        1, 2, 10,
        1, 10, 9,
        2, 3, 11,
        2, 11, 10,
        3, 4, 12,
        3, 12, 11,
        4, 5, 13,
        4, 13, 12,
        5, 6, 14,
        5, 14, 13,
        6, 7, 15,
        6, 15, 14,
        7, 0, 8,
        7, 8, 15,

        // Bottom
        0, 1, 2,
        0, 2, 3,
        0, 3, 4,
        0, 4, 5,
        0, 5, 6,
        0, 6, 7,

        // Top
        8, 9, 10,
        8, 10, 11,
        8, 11, 12, 
        8, 12, 13,
        8, 13, 14,
        8, 14, 15
      ]);
  

      // Normals array
    this.normals = new Float32Array([
        
      ]);


    this.generateIdx();
    this.generatePos();
    this.generateCol();

    this.generateNor();

    this.generateTranslate();

    this.generateScale();

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

  setInstanceVBOs(scale: Float32Array,
                  offsets: Float32Array, 
                  colors: Float32Array,
                  matCol0In: Float32Array,
                  matCol1In: Float32Array,
                  matCol2In: Float32Array,
                  matCol3In: Float32Array) 
  {
    this.colors = colors;
    this.offsets = offsets;

    this.scale = scale;

    this.matCol0 = matCol0In;
    this.matCol1 = matCol1In;
    this.matCol2 = matCol2In;
    this.matCol3 = matCol3In;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufScale);
    gl.bufferData(gl.ARRAY_BUFFER, this.scale, gl.STATIC_DRAW);

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

export default Cylinder;
