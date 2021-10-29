import {vec3, vec4} from 'gl-matrix';
import {gl} from '../globals';
import Instanced from '../rendering/gl/Instanced';

class Plane extends Instanced {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  normals: Float32Array;
  transCol1: Float32Array;
  transCol2: Float32Array;
  transCol3: Float32Array;
  transCol4: Float32Array;
  size: number;
  stepSize: number;

  constructor(size: number, stepSize: number) {
    super(); // Call the constructor of the super class. This is required.
    this.size = size;
    this.stepSize = stepSize;
  }

  create() {
    let pos = [];
    let indices = []
    let idxCount = 0;
    for (let x = -this.size; x < this.size; x += this.stepSize) {
      for (let y = -this.size; y < this.size; y += this.stepSize) {
        pos.push(x);
        pos.push(0);
        pos.push(y);
        pos.push(1);

        pos.push(x + this.stepSize);
        pos.push(0);
        pos.push(y);
        pos.push(1);

        pos.push(x + this.stepSize);
        pos.push(0);
        pos.push(y + this.stepSize);
        pos.push(1);

        pos.push(x);
        pos.push(0);
        pos.push(y + this.stepSize);
        pos.push(1);

        indices.push(idxCount);
        indices.push(idxCount + 1);
        indices.push(idxCount + 2);

        indices.push(idxCount);
        indices.push(idxCount + 2);
        indices.push(idxCount + 3);
        idxCount += 4;
      }
    }

    this.positions = new Float32Array(pos);
    this.indices = new Uint32Array(indices);

    this.generateIdx();
    this.generatePos();
    super.create();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    this.numInstances = 1;
    console.log(`Created plane`);
  }
};

export default Plane;
