import {vec3, mat4, quat} from 'gl-matrix';

export default class Turtle {
    position: vec3 = vec3.create();
    quaternion: quat = quat.create();
    orientation: vec3 = vec3.create();
    scale: vec3 = vec3.create();
    depth: number; 
    angle: number;

  constructor(pos: vec3, orient: vec3, q: quat, a: number, s: vec3, d: number) {
    this.position = pos;
    this.orientation = orient;
    this.quaternion = q;
    this.angle = a;
    this.scale = s;
    this.depth = d;
  }

  moveForward() {
    let scale: number = this.scale[1];
    let distance : vec3 = vec3.create();
    vec3.add(this.position, this.position, vec3.multiply(distance, this.orientation, vec3.fromValues(scale, scale, scale)));
  }

  rotate(axis: vec3, deg: number) {
    vec3.normalize(axis, axis);
    let quaternion: quat = quat.create();
    quat.setAxisAngle(quaternion, axis, deg * Math.PI / 180.0);
    quat.normalize(quaternion,quaternion);
    this.orientation = vec3.transformQuat(this.orientation, this.orientation, quaternion);
    vec3.normalize(this.orientation, this.orientation);
    quat.rotationTo(this.quaternion, vec3.fromValues(0,1,0), this.orientation);
  }

  rotateXUp() {
    let randomness =  Math.floor(Math.random() * 70);
    this.rotate(vec3.fromValues(1,0,0), this.angle + randomness);
  }

  rotateXDown() {
    let randomness =  Math.floor(Math.random() * 70);
    this.rotate(vec3.fromValues(1,0,0), -1.0 * (this.angle + randomness));
  }

  rotateYUp() {
    let randomness: number = Math.floor(Math.random() * 70);
    this.rotate(vec3.fromValues(0,1,0), this.angle + randomness);
  }

  rotateYDown() {
    let randomness: number = Math.floor(Math.random() * 70);
    this.rotate(vec3.fromValues(0,1,0), -1.0 * (this.angle + randomness));
  }

  rotateZUp() {
    let randomness: number = Math.floor(Math.random() * 11) - 5;
    this.rotate(vec3.fromValues(0,0,1), this.angle + randomness);
  }

  rotateZDown() {
    let randomness: number = Math.floor(Math.random() * 11) - 5;
    this.rotate(vec3.fromValues(0,0,1), -1.0 * (this.angle + randomness));
  }

  getTransform() : mat4 {
    let transformation: mat4 = mat4.create();
    mat4.fromRotationTranslationScale(transformation, this.quaternion, this.position, this.scale);
    return transformation;
  }

  getLeafTransform() : mat4 {
    let quaternion: quat = quat.create();

    vec3.normalize(vec3.fromValues(0,0,1), vec3.fromValues(0,0,1));
    quat.setAxisAngle(quaternion, vec3.fromValues(0,0,1), Math.floor(Math.random() * 361) * Math.PI / 180.0);
    quat.normalize(quaternion,quaternion);

    let original_ori: vec3 = vec3.fromValues(this.orientation[0],this.orientation[1],this.orientation[2]);
    original_ori = vec3.transformQuat(original_ori, original_ori, quaternion);
    vec3.normalize(original_ori, original_ori);
    quat.rotationTo(quaternion, vec3.fromValues(0,1,0), original_ori);

    let new_scale: vec3 = vec3.create();
    let updated_scale: number = 1 / (this.scale[0] << 2);
    if (updated_scale > 1.5) {
      updated_scale = 1.5;
    }
    new_scale = vec3.fromValues(updated_scale, updated_scale, updated_scale);

    let transformMat: mat4 = mat4.create();
    mat4.fromRotationTranslationScale(transformMat, quaternion, this.position, new_scale);
    return transformMat;
  }

  drawLeaf() {}
}