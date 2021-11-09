import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
// import { fromQuat } from 'gl-matrix/src/gl-matrix/mat3';
// import { normalize } from 'gl-matrix/src/gl-matrix/vec2';

export default class Turtle {
    // dist: number = 1;
    position: vec3 = vec3.create();
    orientation: vec3 = vec3.create();
    // up: vec3 = vec3.create();
    depth: number;
    scale: number;
    quat: quat;

    constructor(pos: vec3, orient: vec3, scale: number, depth: number) {
        // this.position = pos;
        // this.position = vec3.create();
        vec3.copy(this.position, pos);
        // this.orientation = orient;
        // this.orientation = vec3.create();
        vec3.copy(this.orientation, orient);
        // this.up = vec3.fromValues(0, 1, 0);
        this.depth = depth;
        this.scale = scale;
        
        let initQuat: quat = quat.create();
        let initAng: number = 0.0;
        let initRotAxis: vec3 = vec3.fromValues(0, 0, 1);
        quat.setAxisAngle(initQuat, initRotAxis, initAng);
        quat.normalize(initQuat, initQuat);
        this.quat = initQuat;
    }

    rotate(axis: vec3, angle: number) {
        vec3.normalize(axis, axis);
        let qua = quat.create();
        let initAng = Math.PI * angle / 180.0;
        quat.setAxisAngle(qua, axis, initAng);
        quat.normalize(qua, qua);
        // console.log("qua", qua);

        let tempOri = vec4.fromValues(this.orientation[0], this.orientation[1], this.orientation[2], 0);
        vec4.transformQuat(tempOri, tempOri, qua);
        this.orientation = vec3.fromValues(tempOri[0], tempOri[1], tempOri[2]);
        // console.log("ori", ori)
        // console.log("orientation", this.orientation)

        // vec3.normalize(this.orientation, this.orientation);
        quat.rotationTo(this.quat, vec3.fromValues(0, 1, 0), this.orientation);
        quat.normalize(this.quat, this.quat);
        vec3.normalize(this.orientation, this.orientation);
    }

    // getRotMat() {
    //     let mat = mat4.create();
    //     return mat4.fromQuat(mat, this.quat);
    // }

    getQuat() {
        let tempQuat: quat = quat.create();
        // quat.copy(tempQuat, this.quat);
        quat.invert(tempQuat, this.quat);
        return vec4.fromValues(tempQuat[0], tempQuat[1], tempQuat[2], tempQuat[3]);
    }

    getOffset() {
        let copy = vec3.create();
        return vec3.copy(copy, this.position);
    }

    moveForward(dist: number) {
        // console.log("MOVING FORWARD", dist);
        vec3.normalize(this.orientation, this.orientation);
        let move = vec3.fromValues(this.orientation[0] * dist, this.orientation[1] * dist, this.orientation[2] * dist);
        // console.log("move", move.toString())
        vec3.add(this.position, this.position, move);
        return this;
    }

    copy() {
        let t = new Turtle(this.position, this.orientation, this.scale, this.depth);
        quat.copy(t.quat, this.quat);
        return t;
    }

    logAtts() {
        let map = new Map([
            ["position", this.position.toString()],
            ["orientation", this.orientation.toString()],
            // ["up", this.up.toString()],
            ["depth", this.depth.toString()],
            ["scale", this.scale.toString()],
            ["quat", this.quat.toString()],
        ]);
        for (let entry of map.entries()) {
            console.log(entry[0], entry[1]);
        }
    }

}