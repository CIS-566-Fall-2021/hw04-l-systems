import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import InstancedData from './InstancedData'

abstract class Geometry extends Drawable {
  indices: Array<number>;
  positions: Array<number>;
  colors: Array<number>;
  normals: Array<number>;
  uvs : Array<number>;
  uv_cell : number;
  uv_scale : number;
  tex_divs : number;


  columnX: Float32Array; // Data for bufTranslate
  columnY: Float32Array; // Data for bufTranslate
  columnZ: Float32Array; // Data for bufTranslate
  columnW: Float32Array; // Data for bufTranslate

  uvCell: Float32Array; // Data for bufTranslate

  constructor() {
    super(); // Call the constructor of the super class. This is required.
    this.uv_cell = 3;
    this.tex_divs = 10;
    this.uv_scale = 1.0 / this.tex_divs;
  }

  transformUVs() {
    let cel_y = this.uv_scale * Math.floor(this.uv_cell / this.tex_divs);
    let cel_x = this.uv_scale * (this.uv_cell % this.tex_divs);
    let nextcel_y = this.uv_scale * Math.floor(this.uv_cell / this.tex_divs + 1);

    for(let i = 0; i < this.uvs.length - 1; i+= 2) {
      let uvX = this.uvs[i]
      let uvY = this.uvs[i + 1]
      uvX *= this.uv_scale;
      uvY *= this.uv_scale;

      this.uvs[i] = uvX + cel_x
      this.uvs[i + 1] = Math.min(uvY + cel_y,nextcel_y - 0.007)
 
    }
  }
    
  setInstanceVBOs(data : InstancedData) {
    this.columnX = new Float32Array(data.transformColumnX);
    this.columnY = new Float32Array(data.transformColumnY);
    this.columnZ = new Float32Array(data.transformColumnZ);
    this.columnW = new Float32Array(data.transformColumnW);
    this.uvCell = new Float32Array(data.uvCell);

    //console.log("uv cell" ,this.uvCell)
   // console.log("data size" ,data.size)

    this.generateTransform();
    this.generateUVCell();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformX);
    gl.bufferData(gl.ARRAY_BUFFER, this.columnX, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformY);
    gl.bufferData(gl.ARRAY_BUFFER, this.columnY, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformZ);
    gl.bufferData(gl.ARRAY_BUFFER, this.columnZ, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformW);
    gl.bufferData(gl.ARRAY_BUFFER, this.columnW, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUVCell);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvCell, gl.STATIC_DRAW);

   // console.log("col x ha ndle", this.bufTransformX)
   // console.log("col y ha ndle", this.bufTransformY)

  }

  abstract create() : void

};

export default Geometry;
