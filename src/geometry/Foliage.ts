import {vec2, vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Mesh from './Mesh';
import LSystem from './LSystem';
import Cylinder from './Cylinder';
import InstancedData from './InstancedData';

import Turtle from './Turtle';
import Utils from './Utils';

class Foliage extends LSystem  {
  orchidSize : number;

  smoothfactor = 1.0;

  constructor() {
    super();
    this.axiom = "TX";
    this.turtleStack = new Array<Turtle>();
    this.meshes = new Array<Mesh>();
    
    this.iterations = 3;
    this.charExpansions = new Map();
    this.charToAction = new Map();
    this.expandedSentence = "";
    this.currTurtle = new Turtle();
    this.currTurtle.prevPosition = vec3.fromValues(0,-this.height,0);
    this.decay = 0.2;
    this.stepDecay = 0.1;
    this.orchidSize = 1.6;
    this.radius = 0.2;
    this.offset = -0.01;

    this.charExpansions.clear();
    this.charToAction.clear();
    this.fillCharExpansions();
    this.fillCharToAction();

    
  }

  fillCharToAction() {
    this.charToAction.set('F', () => {
      this.advanceTurtleBy(1.0);
    });

    this.charToAction.set('A', () => {
      this.advanceTurtleBy(3.0);
    });

    this.charToAction.set('B', () => {
      this.advanceTurtleBy(1.0);
    });

    this.charToAction.set('>', () => {
      this.rotateTurtleXBy(this.randomAngle());
    });

    this.charToAction.set('<', () => {
      this.rotateTurtleXBy(-this.randomAngle());
    });

    this.charToAction.set('-', () => {
      this.rotateTurtleZBy(-this.randomAngle());
    });
    this.charToAction.set('+', () => {
      this.rotateTurtleZBy(this.randomAngle());
    });

    this.charToAction.set('1', () => {
      this.rotateTurtleXBy(30);
    });

    this.charToAction.set('2', () => {
      this.rotateTurtleXBy(-30);
    });

    this.charToAction.set('3', () => {
      this.rotateTurtleZBy(-30);
    });

    this.charToAction.set('4', () => {
      this.rotateTurtleZBy(30);
    });

    this.charToAction.set('y', () => {
      this.rotateTurtleYBy(-this.randomAngle());
    });

    this.charToAction.set('u', () => {
      this.rotateTurtleYBy(this.randomAngle());
    });

    this.charToAction.set('d', () => {
      this.addTurtleDepth(1);
    });

    this.charToAction.set('[', () => {
      this.pushTurtle();
    });

    this.charToAction.set(']', () => {
      this.popTurtle();
    });

    this.charToAction.set('s', () => {
      let tex = Math.floor(5.0 + this.rand.random() * 5.0);
      this.sproutLeaf(tex);
    });

    this.charToAction.set('l', () => {
      let tex = Math.floor(5.0 + this.rand.random() * 5.0);
      this.sproutLeaf(tex);
    });0
  }

  advanceTurtleBy(frac: number) {
     let sF = Math.exp(-this.currTurtle.depth * this.decay) * this.radius;
     let sStep = this.randomStep();
    let nextPos = vec3.create()
    vec3.scaleAndAdd(nextPos, this.currTurtle.position, this.currTurtle.orientation, sStep)

    this.currTurtle.depth += frac; //Math.max(0.2, Math.min(1.0 / (sF * 14), 0.7));

    let center = vec3.create();
    vec3.add(center, this.currTurtle.position, nextPos)
    vec3.scale(center, center, 0.5)
    vec3.copy(this.currTurtle.position, nextPos)

    let transform = Utils.rightUpForwardTransformMatrix(center, 
      this.currTurtle.right, this.currTurtle.up, this.currTurtle.orientation, 
      vec3.fromValues(sF, sF, sStep *1.2));

    let randTex = Math.floor(this.rand.random() * 5.0);
    this.branchInstances.addInstance(transform, randTex);

  }


  advanceTurtleOld(frac : number) {
    let sF = Math.exp(-this.currTurtle.depth * this.decay) * this.radius;
    let sStep = Math.exp(-this.currTurtle.depth * this.stepDecay) * this.height;
    let rotMat = mat4.create();
    mat4.rotateX(rotMat, rotMat, this.currTurtle.orientation[0] * Math.PI / 180)
    mat4.rotateY(rotMat, rotMat, this.currTurtle.orientation[1] * Math.PI / 180)
    mat4.rotateZ(rotMat, rotMat, this.currTurtle.orientation[2] * Math.PI / 180)

    let offset = this.height / 15;
    let step = vec3.fromValues(0,sStep  - offset,0);
    vec3.transformMat4(step, step, rotMat);
    this.currTurtle.depth += frac;
    
    vec3.scaleAndAdd(this.currTurtle.position, this.currTurtle.position, step, 1);

  }

  sproutLeaf(texCell = 4.0) {    
    let stoch = vec3.create()
    vec3.random(stoch)
    vec3.scale(stoch,stoch, 20)
    let randOff = Math.random() * 3 - 2

    randOff = Math.min(randOff, 0)
    let rotMat = mat4.create();
    let step = vec3.fromValues(0,1,0);
    vec3.transformMat4(step, step, rotMat);
    let transform = Utils.rightUpForwardTransformMatrix(this.currTurtle.position, 
      this.currTurtle.right, this.currTurtle.up, this.currTurtle.orientation, 
      vec3.fromValues(this.leaf_size, this.leaf_size, this.leaf_size));
    this.leafInstances.addInstance(transform, texCell);

    }

  addTurtleDepth(d : number) {
    this.currTurtle.depth += d;
  }

  setAxiom() {
    // Orchid like
    //this.axiom = 'AAAAyF';

    this.axiom = 'B>BBF';
    //this.axiom = 'FFFFyyFyyFyyFyy+++yyyFy[FF]yy++[FF]+yF';


  }

  fillCharExpansions() {
   // console.log("orchids EXPANSION");

    //Orchid like
    //this.charExpansions.set('F', 'F<+++Fs[<F]')

    // Tree Like
    this.charExpansions.set('F', 'ByBu[yyFyFs]+++[<><<FFl<<]++[-FFl>>]+++[>>F>>Fs>>>]')
    //this.charExpansions.set('A', 'AA')



  //   this.charExpansions.set('X', '[ddd>>AsAsX]AA[+ddd<<<AsAsX]A[ddd---AsAsX]AAAs');
  //   this.charExpansions.set('Y', '[dd+dAsAsX][ddd-dAsAsX][dd>>dAsAsX]');

  //   this.charExpansions.set('T', 'AA[>>>>>>>AAAT]T');

  //   this.charExpansions.set('G', 'A[<<<<<<<<<<<<A]');

  //  // this.charExpansions.set('F', 'F');
  //   //this.charExpansions.set('A', '-B>');
  //   //this.charExpansions.set('B', '<F');
  //   this.charExpansions.set('s', '33s44');
  //   this.charExpansions.set('s', '11s22');

    //this.charExpansions.set('+', '+F');
    //this.charExpansions.set('-', '-F');
    //this.charExpansions.set('Y', '[yylyyyylyyy>>>ylY]');
    
    //this.charExpansions.set('T', 'F<<<<++F--');
  
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

};

export default Foliage;
