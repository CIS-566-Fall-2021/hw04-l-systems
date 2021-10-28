import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import * as Loader from 'webgl-obj-loader';
var fs = require('fs');


class Mesh extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  uvs: Float32Array;
  center: vec4;
  columnX: Float32Array; // Data for bufTranslate
  columnY: Float32Array; // Data for bufTranslate
  columnZ: Float32Array; // Data for bufTranslate
  columnW: Float32Array; // Data for bufTranslate


  objString: string;

  constructor(objString: string, center: vec3 = vec3.fromValues(0,0,0)) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.objString = objString;
  }

  create() {  
  //   fs.readFile('./Index.html', (err : any, data : any) => {
  //     if (err) {
  //         throw err;
  //     }
  //     const content = data;
  
  //     // Invoke the next step here however you like
  //     console.log(content);   // Put all of the code here (not the best solution)
  //    // processFile(content);   // Or put the next step in a function and invoke it
  // });
  
    let posTemp: Array<number> = [];
    let norTemp: Array<number> = [];
    let uvsTemp: Array<number> = [];
    let idxTemp: Array<number> = [];

    var loadedMesh = new Loader.Mesh(this.objString);
    
    console.log(this.objString)
    //posTemp = loadedMesh.vertices;
    for (var i = 0; i < loadedMesh.vertices.length; i++) {
      posTemp.push(loadedMesh.vertices[i]);
      if (i % 3 == 2) posTemp.push(1.0);
    }

    console.log(loadedMesh.vertices)
    for (var i = 0; i < loadedMesh.vertexNormals.length; i++) {
      norTemp.push(loadedMesh.vertexNormals[i]);
      if (i % 3 == 2) norTemp.push(0.0);
    }

    uvsTemp = loadedMesh.textures;
    idxTemp = loadedMesh.indices;

    // white vert color for now
    this.colors = new Float32Array(posTemp.length);
    for (var i = 0; i < posTemp.length; ++i){
      this.colors[i] = 1.0;
    }

    this.indices = new Uint32Array(idxTemp);
    this.normals = new Float32Array(norTemp);
    this.positions = new Float32Array(posTemp);
    this.uvs = new Float32Array(uvsTemp);

    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateUV();
    this.generateCol();
    this.generateTransform();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);

    console.log(`Created Mesh from OBJ`);
    console.log(this.count);

    this.objString = ""; // hacky clear
  }

  setInstanceVBOs(columnX: Float32Array, columnY: Float32Array, columnZ: Float32Array, columnW: Float32Array) {
    this.columnX = columnX;
    this.columnY = columnY;
    this.columnZ = columnZ;
    this.columnW = columnW;

    console.log(this.columnX)
    console.log(this.columnY)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformX);
    gl.bufferData(gl.ARRAY_BUFFER, this.columnX, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformY);
    gl.bufferData(gl.ARRAY_BUFFER, this.columnY, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformZ);
    gl.bufferData(gl.ARRAY_BUFFER, this.columnZ, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformW);
    gl.bufferData(gl.ARRAY_BUFFER, this.columnW, gl.STATIC_DRAW);

  }
};

export default Mesh;
