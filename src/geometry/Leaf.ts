import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl,readTextFile} from '../globals';
import * as Loader from 'webgl-obj-loader';
import { debug } from 'console';

class Leaf extends Drawable {

  // basic mesh info
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  uvs: Float32Array;

  // loading from file
  objString: string;
  objfile: string;
  objtextfile:string;

  // instance info
  trans: Float32Array;
  quat: Float32Array;
  scale: Float32Array;


  constructor(objfile: string, objtextfile:string) {
    super(); // Call the constructor of the super class. This is required.
    this.objfile = objfile;
    this.objtextfile = objtextfile; 
    this.objString = readTextFile(this.objfile);
    this.loadTexture(this.objtextfile);
  }

  create() {  
    let posTemp: Array<number> = [];
    let norTemp: Array<number> = [];
    let uvsTemp: Array<number> = [];
    let idxTemp: Array<number> = [];

    var loadedMesh = new Loader.Mesh(this.objString);
    idxTemp =  loadedMesh.indices;

    // pos & normal
    for (var i = 0; i < loadedMesh.vertices.length; i++) {
      posTemp.push(loadedMesh.vertices[i]*0.004);
      norTemp.push(loadedMesh.vertexNormals[i]);
      if (i % 3 == 2) {
        posTemp.push(1.0);
        norTemp.push(0.0);
      }
    }


    // default: white color
    this.colors = new Float32Array(posTemp.length);
    for (var i = 0; i < posTemp.length; ++i){
      this.colors[i] = 1.0;
    }

    // uv input
    this.uvs = new Float32Array(loadedMesh.textures.length);
    for (var i = 0; i <loadedMesh.textures.length;i++){
        this.uvs[i] = loadedMesh.textures[i];
    }

    this.indices = new Uint32Array(idxTemp);
    this.normals = new Float32Array(norTemp);
    this.positions = new Float32Array(posTemp);

    this.generateIdx();
    this.generateNor();
    this.generatePos();
    this.generateUV();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);


    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);

    console.log(`Created Mesh from` + this.objfile);
    this.objString = ""; // hacky clear
  }


  loadTexture(url: string) {
    const texture = this.generateTex();

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      
    };
    image.src = url;

    this.texture = texture;
    console.log(this.texture);
  }

  setInstanceVBOs(translation: Float32Array, quaternion: Float32Array, scale: Float32Array) {
    this.trans = translation;
    this.quat = quaternion;
    this.scale = scale;

    this.generateQuat();
    this.generateTranslate();
    this.generateScale();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    gl.bufferData(gl.ARRAY_BUFFER, this.trans, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufQuat);
    gl.bufferData(gl.ARRAY_BUFFER, this.quat, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufScale);
    gl.bufferData(gl.ARRAY_BUFFER, this.scale, gl.STATIC_DRAW);

    
  }

};

export default Leaf;