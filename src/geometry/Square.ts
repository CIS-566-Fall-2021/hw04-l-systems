import {vec3, vec4, mat4} from 'gl-matrix';
import Geometry from './Geometry';
import {gl} from '../globals';

class Square extends Geometry {
  offsets: Float32Array; // Data for bufTranslate
  scales: Float32Array; // Data for bufTranslate

  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {

  let indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3]);
  let positions = new Float32Array([-0.5, -0.5, 0, 1,
                                     0.5, -0.5, 0, 1,
                                     0.5, 0.5, 0, 1,
                                     -0.5, 0.5, 0, 1]);

  let normals = new Float32Array([0.0, 0.0, 1.0, 0,
    0.0, 0.0, 1.0, 0,
    0.0, 0.0, 1.0, 0,
    0.0, 0.0, 1.0, 0,]);
 

    this.uvs = new Array<number>();

    this.uvs.push(0)
    this.uvs.push(0)

    this.uvs.push(1)
    this.uvs.push(0)

    this.uvs.push(1)
    this.uvs.push(1)

    this.uvs.push(0)
    this.uvs.push(1)

    this.transformUVs()

    let uv : Float32Array = Float32Array.from(this.uvs);

    this.generateIdx();
    this.generatePos();
    this.generateCol();
    this.generateTranslate();
    this.generateScale();
    this.generatePos();
    this.generateNor();

    this.generateUV();


    this.count = indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    console.log(`Created square`);
  }

};

export default Square;
