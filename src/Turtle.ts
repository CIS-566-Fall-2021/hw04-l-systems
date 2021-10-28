import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
// import { fromQuat } from 'gl-matrix/src/gl-matrix/mat3';
// import { normalize } from 'gl-matrix/src/gl-matrix/vec2';

export default class Turtle {
    // dist: number = 1;
    position: vec3 = vec3.create();
    orientation: vec3 = vec3.create();
    up: vec3 = vec3.create();
    depth: number;
    scale: vec3 = vec3.create();
    quat: quat;

    constructor(pos: vec3, orient: vec3) {
        // this.position = pos;
        // this.position = vec3.create();
        vec3.copy(this.position, pos);
        // this.orientation = orient;
        // this.orientation = vec3.create();
        vec3.copy(this.orientation, orient);
        this.up = vec3.fromValues(0, 1, 0);
        this.depth = 0;
        this.scale = vec3.fromValues(1, 1, 1);
        
        let initQuat: quat = quat.create();
        let initAng: number = 0.0;
        let initRotAxis: vec3 = vec3.fromValues(0, 0, 1);
        quat.setAxisAngle(initQuat, initRotAxis, initAng);
        quat.normalize(initQuat, initQuat);
        this.quat = initQuat;
    }

    setScale(x: number, y: number, z: number) {
        this.scale = vec3.fromValues(x, y, z);
    }

    rotate(axis: vec3, angle: number) {
        vec3.normalize(axis, axis);
        let qua = quat.create();
        let initAng = Math.PI * angle / 180.0;
        quat.setAxisAngle(qua, axis, initAng);
        quat.normalize(qua, qua);
        // console.log("qua", qua);

        let ori = vec4.fromValues(this.orientation[0], this.orientation[1], this.orientation[2], 0);
        vec4.transformQuat(ori, ori, qua);
        this.orientation = vec3.fromValues(ori[0], ori[1], ori[2]);
        // console.log("ori", ori)
        // console.log("orientation", this.orientation)

        // vec3.normalize(this.orientation, this.orientation);
        quat.rotationTo(this.quat, this.up, this.orientation);
        quat.normalize(this.quat, this.quat);
    }

    getRotMat() {
        let mat = mat4.create();
        return mat4.fromQuat(mat, this.quat);
    }

    transformationMat(vector: vec3) {
        let rotation = mat4.create();
        mat4.fromQuat(rotation, this.quat);

        let translation = mat4.create();
        mat4.fromTranslation(translation, this.position);

        let scale = mat4.create();
        mat4.fromScaling(scale, this.scale);

        var tempVec = vec4.fromValues(vector[0], vector[1], vector[2], 1);
        let scaledResult = vec4.create();
        vec4.transformMat4(scaledResult, tempVec, scale);
        let rotatedResult = vec4.create();
        vec4.transformMat4(rotatedResult, scaledResult, rotation);
        let translatedResult = vec4.create();
        vec4.transformMat4(translatedResult, rotatedResult, translation);
        
        console.log(translatedResult[0]);
        console.log(translatedResult[1]);
        console.log(translatedResult[2]);
        return translatedResult;
    }

    moveForward(dist: number) {
        vec3.normalize(this.orientation, this.orientation);
        let move = vec3.fromValues(this.position[0] * dist, this.position[1] * dist, this.position[2] * dist);
        vec3.add(this.position, this.position, move);
    }

    copy() {
        let t = new Turtle(this.position, this.orientation);
        vec3.copy(t.up, this.up);
        t.depth = this.depth;
        quat.copy(t.quat, this.quat);
        return t;
    }

    logAtts() {
        let map = new Map([
            ["position", this.position.toString()],
            ["orientation", this.orientation.toString()],
            ["up", this.up.toString()],
            ["depth", this.depth.toString()],
            ["scale", this.scale.toString()],
            ["quat", this.quat.toString()],
        ]);
        for (let entry of map.entries()) {
            console.log(entry[0], entry[1]);
        }
    }

}