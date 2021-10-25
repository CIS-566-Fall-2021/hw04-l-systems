import {vec3, mat3, vec4, mat4, quat} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Mesh from './Mesh';
var OBJ = require('webgl-obj-loader') ;

class Turtle {
  prevPosition: vec3;
  prevOrientation : vec3;
  prevDepth : number;

  position: vec3;

  // Forward vector
  orientation: vec3;
  right : vec3;
  up : vec3;

  depth : number;

  constructor() {
    this.prevPosition = vec3.fromValues(0,0,0);
    this.position = vec3.fromValues(0,0,0);
    this.prevDepth = -1;
    this.prevOrientation = vec3.fromValues(0,1,0);

    this.orientation = vec3.fromValues(0,1,0);
    this.right = vec3.fromValues(1,0,0);
    this.up = vec3.fromValues(0,0,-1);

    this.orientation = vec3.fromValues(0,1,0);
    this.right = vec3.fromValues(1,0,0);
    this.up = vec3.fromValues(0,0,1);


    this.depth = 0;

  }

  normalizeAxes() {
    vec3.normalize(this.orientation, this.orientation)
    vec3.normalize(this.right, this.right)
    vec3.normalize(this.up, this.up)

  }

  rotateAboutForward(degree : number) {
    var rot = quat.create();
    let angle = degree * Math.PI / 180.0
    quat.setAxisAngle(rot, this.orientation, angle)
    vec3.transformQuat(this.right, this.right, rot)
    vec3.transformQuat(this.up, this.up, rot)
    this.normalizeAxes()
  }

  rotateAboutRight(degree : number) {
    var rot = quat.create();
    let angle = degree * Math.PI / 180.0
    quat.setAxisAngle(rot, this.right, angle)
    vec3.transformQuat(this.orientation, this.orientation, rot)
    vec3.transformQuat(this.up, this.up, rot)
    this.normalizeAxes()
  }

  rotateAboutUp(degree : number) {
    var rot = quat.create();
    let angle = degree * Math.PI / 180.0
    quat.setAxisAngle(rot, this.up, angle)
    vec3.transformQuat(this.right, this.right, rot)
    vec3.transformQuat(this.orientation, this.orientation, rot)
    this.normalizeAxes()
  }

  copyshallow(t : Turtle) {
    vec3.copy(this.prevPosition, t.prevPosition);
    vec3.copy(this.prevOrientation, t.prevOrientation);

    vec3.copy(this.position, t.position);
    vec3.copy(this.orientation, t.orientation);
    vec3.copy(this.right, t.right);
    vec3.copy(this.up, t.up);

    this.depth = t.depth;
    this.prevDepth = t.prevDepth;

  }
}

export default Turtle;
