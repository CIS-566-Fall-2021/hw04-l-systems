import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Mesh from './Mesh';
import Turtle from './Turtle';
import InstancedData from './InstancedData';
import Utils from './Utils';
var randGen = require('random-seed');
var OBJ = require('webgl-obj-loader') ;


class LSystem  {
  seed : number;
  rand : any;
  axiom : string;
  currTurtle : Turtle;
  buffer: ArrayBuffer;
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  iterations :number;
  center: vec4;
  decay : number;
  stepDecay : number;
  radius : number;
  height : number;
  offset : number;
  curvature : number;
  smoothshading : boolean;
  leaf_size : number
  turtleStack : Array<Turtle>;

  length_stoch : number;

  meshes : Array<Mesh>;
  fullMesh : Mesh;
  meshNames : Map<string, Mesh>;
  created = false
  charExpansions : Map<string, string>;
  charToAction : Map<string, ()=> any>;
  expandedSentence : string;

  orientRand : number;
  branchInstances : InstancedData;
  leafInstances : InstancedData;

  constructor() {
    this.axiom = "X";
    this.turtleStack = new Array<Turtle>();
    this.meshes = new Array<Mesh>();
    this.fullMesh = new Mesh("");
    this.iterations = 3;
    this.charExpansions = new Map();
    this.charToAction = new Map();
    this.expandedSentence = "";
    this.currTurtle = new Turtle();
    this.orientRand = 0;
    this.fillCharExpansions();
    this.fillCharToAction();
    this.curvature = 5;
    this.height = 0.2;
    this.leaf_size = 1;
    this.smoothshading = true;
    this.branchInstances = new InstancedData();
    this.leafInstances = new InstancedData();

  }


    fillMeshNames() {
    this.meshNames = new Map<string, Mesh>();
    OBJ.downloadMeshes({
      'orchid': './geo/orchid.obj',
      'stem': './geo/stem.obj',
      'leaf': './geo/leaf.obj',
      'petal': './geo/petal.obj',
      'plane': './geo/plane.obj',

    }, (meshes: any) => {
      for (let item in meshes) {
        //console.log("Item" + item.toString());
        let mesh = new Mesh('/geo/cube.obj');
        //mesh.loadMesh(meshes[item]);
        this.meshNames.set(item.toString(), mesh);

      }

      //this.loadMesh(meshes.mesh);
      this.expandAxiom();
      this.moveTurtle();
      //this.createAll();
    
      //console.log()
    });
  }

  setSeed(seed : number) {
    this.seed = seed;
    this.rand = randGen.create();
    this.rand.seed(this.seed);
  }

  setAxiom() {
    this.axiom = "X";

  }
  refreshSystem() {
    this.setAxiom();
    this.expandAxiom();
    this.moveTurtle();

   //this.fillMeshNames();
  }

  fillCharToAction() {
    this.charToAction.set('F', () => {
      this.advanceTurtle();
    });

    this.charToAction.set('>', () => {
      this.rotateTurtleX();
    });


    this.charToAction.set('.', () => {
      this.rotateTurtleZ();
    });


    this.charToAction.set('[', () => {
      this.pushTurtle();
    });

    this.charToAction.set(']', () => {
      this.popTurtle();
    });
  }


  randomAngle() {
    let randOffset = (this.rand.random() - 0.5) * this.orientRand
    return this.curvature + randOffset
  }

  // Currently returns deterministic value
  randomStep() {
    let randOffset = 1 + (this.rand.random()) * this.length_stoch
    return 3.0 * Math.exp(-this.currTurtle.depth * this.stepDecay) * (this.height) ;
  }
   advanceTurtle() {
   // let mesh = new Mesh('/geo/feather.obj', vec3.clone(this.currTurtle.position), vec3.fromValues(1,1,1), vec3.clone(this.currTurtle.orientation))
   // this.fullMesh.transformAndAppend(this.meshNames.get("stem"), mesh);

    let rotMat = mat4.create();
    mat4.rotateX(rotMat, rotMat, this.currTurtle.orientation[0] * Math.PI / 180)
    mat4.rotateY(rotMat, rotMat, this.currTurtle.orientation[1] * Math.PI / 180)
    mat4.rotateZ(rotMat, rotMat, this.currTurtle.orientation[2] * Math.PI / 180)

    let step = vec3.fromValues(0,1,0);
    vec3.transformMat4(step, step, rotMat);

    //vec3.scaleAndAdd(this.currTurtle.position, this.currTurtle.position, step, this.currTurtle.depth);
    vec3.scaleAndAdd(this.currTurtle.position, this.currTurtle.position, step, 1);

  }

  rotateTurtleX() {
    this.currTurtle.rotateAboutRight(30)
  }

  rotateTurtleXBy(angle:number) {
    this.currTurtle.rotateAboutRight(angle)
  }


  rotateTurtleYBy(angle:number) {
    this.currTurtle.rotateAboutUp(angle)
  }
  rotateTurtleY() {
    this.currTurtle.rotateAboutUp(30)

  }

  rotateTurtleZ() {
    this.currTurtle.rotateAboutForward(30)
  }

  rotateTurtleZBy(angle:number) {
    this.currTurtle.rotateAboutForward(angle)
  }

  
  fillCharExpansions() {
    console.log("regular EXPANSION");

    this.charExpansions.set('X', 'X.>>[X[.F].>F.F[XF]FX]');
  }

  pushTurtle() {
    this.turtleStack.push(this.currTurtle);

    let prevTurtle = this.currTurtle;
    this.currTurtle = new Turtle();
    this.currTurtle.copyshallow(prevTurtle);

  }

  popTurtle() {
    this.currTurtle = this.turtleStack.pop();
    //console.log(this.currTurtle);

  }

  expandAxiom() {
    let prevAxiom = this.axiom;
    for(let i = 0; i < this.iterations;i++) {
      let sentence :string = "";
      for(let c of prevAxiom) {
        if(this.charExpansions.get(c) == undefined) {
          sentence = sentence.concat(c);

        } else {
          sentence = sentence.concat(this.charExpansions.get(c).toString());

        }
      }
      prevAxiom = sentence;

    }
    this.expandedSentence = prevAxiom;
  }

  moveTurtle() {
    for(let c of this.expandedSentence) {
      if(this.charToAction.get(c) == undefined) {
        continue;
      }
      this.charToAction.get(c)();
    }
  }

  createAll() {
    //console.log("creating all");
    this.fullMesh.create();

   // console.log("MESH UVS " + this.fullMesh.uvs)
    //console.log("MESH UVS " + this.fullMesh.positions)
    this.created = true
    //console.log(this.fullMesh);

  }

  

};

export default LSystem;