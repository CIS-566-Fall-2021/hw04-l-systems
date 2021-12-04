import {vec3, vec4, mat4, mat3, quat} from 'gl-matrix';

class Turtle {
  position: vec3;
  aim: vec3;
  scale: vec3;
  step: number; // step length
  up: vec3;
  quaternion: quat;
  level: number;


  constructor(position: vec3, aim: vec3, scale: vec3, step: number, up: vec3, quaternion: quat, level: number) {
    this.position = position;
    this.aim = aim;
    this.scale = scale;
    this.step = step;
    this.up = up;
    this.quaternion = quaternion;
    this.level = level;
  }

  toRadians(angle: number) {
    return Math.PI * angle / 180.0;
  }

  rotateVectorByQuat(v: vec3) {
    let result: vec3 = vec3.create();
    vec3.transformQuat(result, v, this.quaternion);
    return result;
  }
  
  rotate(axis: vec3, angle: number) {
    vec3.normalize(axis, axis);

    let q: quat = quat.create();
    let q1: quat = quat.create();    
    quat.setAxisAngle(q1, axis, this.toRadians(angle));

    let tempAim: vec4 = vec4.fromValues(this.aim[0], this.aim[1], this.aim[2], 0);
    vec4.transformQuat(tempAim, tempAim, q1);
    this.aim = vec3.fromValues(tempAim[0], tempAim[1], tempAim[2]);

    // update quat
    quat.multiply(this.quaternion,q1,this.quaternion);
    quat.normalize(this.quaternion, this.quaternion);

  }

  reverseAimY() {
    this.aim[1] = -this.aim[1];
    quat.rotationTo(this.quaternion, this.up, this.aim);
    quat.normalize(this.quaternion, this.quaternion);
  }

  forward() {
    let moveAmount: vec3 = vec3.create();
    vec3.copy(moveAmount, this.aim);
    vec3.scale(moveAmount, moveAmount, this.step * this.scale[1]);
    vec3.add(this.position, this.position, moveAmount);
  }

  branch() {
    let newPosition: vec3 = vec3.create();
    vec3.copy(newPosition, this.position);
    let newAim: vec3 = vec3.create();
    vec3.copy(newAim, this.aim);
    let newScale: vec3 = vec3.create();
    vec3.copy(newScale, this.scale);
    let newUp = vec3.create();
    vec3.copy(newUp, this.up);
    let newQuat = quat.create();
    quat.copy(newQuat, this.quaternion);

    let newTurtle: Turtle = new Turtle(newPosition, newAim, newScale, this.step, newUp, newQuat, this.level);
    return newTurtle;
  }

  getRight(){
    let right: vec3 = this.rotateVectorByQuat(vec3.fromValues(1,0,0));
    return right;
  }

  getUp(){
    let up: vec3 = this.rotateVectorByQuat(vec3.fromValues(0,1,0));
    return this.aim;
  }

  getLook(){
    let look: vec3 = this.rotateVectorByQuat(vec3.fromValues(0,0,1));
    return look;
  }
}

export default Turtle;