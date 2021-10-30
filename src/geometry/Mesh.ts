import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
// import * as Loader from 'webgl-obj-loader';
const Loader = require("webgl-obj-loader")

function readTextFile(file: string):string
{
    var allText = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return allText;
}
class Mesh extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  uvs: Float32Array;
  center: vec4;
  transformCols0: Float32Array;
  transformCols1: Float32Array;
  transformCols2: Float32Array;
  transformCols3: Float32Array;

  offsets: Float32Array; // Data for bufTranslate

  objString: string;

  constructor(objString: string, center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);

    this.objString = objString;
  }

  create() {  
    let posTemp: Array<number> = [];
    let norTemp: Array<number> = [];
    let uvsTemp: Array<number> = [];
    let idxTemp: Array<number> = [];

    var loadedMesh = new Loader.Mesh(readTextFile(this.objString));

    //posTemp = loadedMesh.vertices;
    for (var i = 0; i < loadedMesh.vertices.length; i++) {
      posTemp.push(loadedMesh.vertices[i]);
      if (i % 3 == 2) posTemp.push(1.0);
    }

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
    // this.generateTranslate();
    this.generateTransformCol0();
    this.generateTransformCol1();
    this.generateTransformCol2();
    this.generateTransformCol3();

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
    this.objString = ""; // hacky clear
  }

  setInstanceVBOs(transformCols0Temp: Float32Array, transformCols1Temp: Float32Array, transformCols2Temp: Float32Array, transformCols3Temp: Float32Array, colors: Float32Array) {
    this.colors = colors;
    this.transformCols0 = transformCols0Temp;
    this.transformCols1 = transformCols1Temp;
    this.transformCols2 = transformCols2Temp;
    this.transformCols3 = transformCols3Temp;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCols0);
    gl.bufferData(gl.ARRAY_BUFFER, this.transformCols0, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCols1);
    gl.bufferData(gl.ARRAY_BUFFER, this.transformCols1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCols2);
    gl.bufferData(gl.ARRAY_BUFFER, this.transformCols2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCols3);
    gl.bufferData(gl.ARRAY_BUFFER, this.transformCols3, gl.STATIC_DRAW);
  }
};

export default Mesh;
