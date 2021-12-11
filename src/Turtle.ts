import { glMatrix, vec3, vec4 } from "gl-matrix";
import { mat4 } from "gl-matrix";
import { totalmem } from "os";

export default class Turtle {
    pos: vec4 = vec4.create();
    depth: number = 0;
    forward: vec4 = vec4.create();
    right: vec4 = vec4.create();
    up: vec4 = vec4.create();
    scale: number;

    constructor(pos: vec4, f: vec4, r: vec4, u: vec4, d: number, s: number) {
        this.pos = pos;
        this.depth = d;
        this.forward = f;
        this.right = r;
        this.up = u;
        this.scale = s;
    }

    moveForward() {
        var step: number = this.scale;
        this.pos[0] = this.pos[0] + step * this.forward[0];
        this.pos[1] = this.pos[1] + step * this.forward[1];
        this.pos[2] = this.pos[2] + step * this.forward[2];
    }

    FForward(angle: number) {
        var a = glMatrix.toRadian(angle);
        var rot = mat4.create();
        var axis = vec3.fromValues(this.forward[0], this.forward[1], this.forward[2]);
        mat4.fromRotation(rot, a, axis);
        vec4.normalize(this.right, vec4.transformMat4(this.right, this.right, rot));
        vec4.normalize(this.up, vec4.transformMat4(this.up, this.up, rot));
    }

    FBackward(angle: number) {
        this.FForward(-1 * angle);
    }


    UForward(angle: number) {
        var a = glMatrix.toRadian(angle);
        var rot = mat4.create();
        var axis = vec3.fromValues(this.up[0], this.up[1], this.up[2]);
        mat4.fromRotation(rot, a, axis);
        vec4.normalize(this.right, vec4.transformMat4(this.right, this.right, rot));
        vec4.normalize(this.forward, vec4.transformMat4(this.forward, this.forward, rot));
    }

    UBackward(angle: number) {
        this.UForward(-1 * angle);
    }

    RForward(angle: number) {
        var a = glMatrix.toRadian(angle);
        var rot = mat4.create();
        var axis = vec3.fromValues(this.right[0], this.right[1], this.right[2]);
        mat4.fromRotation(rot, a, axis);
        vec4.normalize(this.up, vec4.transformMat4(this.up, this.up, rot));
        vec4.normalize(this.forward, vec4.transformMat4(this.forward, this.forward, rot));
    }

    RBackward(angle: number) {
        this.RForward(-1 * angle);
    }

    getRotationMatrix(): mat4 {
        var originDir: vec3 = vec3.fromValues(0, 1, 0);
        var forwardDir: vec3 = vec3.fromValues(this.forward[0], this.forward[1], this.forward[2]);
        var rotAxis = vec3.create();
        vec3.cross(rotAxis, originDir, forwardDir);
        var angle = Math.acos(vec3.dot(originDir, forwardDir) / (vec3.length(originDir) * vec3.length(forwardDir)));
        var rotMatrix = mat4.create();
        mat4.fromRotation(rotMatrix, angle, rotAxis);
        return rotMatrix;
    }

    getTranslationMatrix(): mat4 {
        var identity = mat4.create();
        var transMatrix = mat4.create();
        mat4.identity(identity);
        mat4.translate(transMatrix, identity, vec3.fromValues(this.pos[0], this.pos[1], this.pos[2]));
        return transMatrix;
    }

    decreaseScale(f: number) {
        this.scale = this.scale * f;
    }

    getScaleMatrix(): mat4 {
        var scaleMatrix = mat4.create();
        let identity = mat4.create();
        mat4.identity(identity);
        mat4.scale(scaleMatrix, identity, vec3.fromValues(this.scale, this.scale, this.scale));
        return scaleMatrix;
    }

    getScaleMatrixCustom(s: number) : mat4 {
        var scaleMatrix = mat4.create();
        let identity = mat4.create();
        mat4.identity(identity);
        mat4.scale(scaleMatrix, identity, vec3.fromValues(s, s, s));
        return scaleMatrix;
    }

    getTransform(): mat4 {
        var output = mat4.create();
        mat4.multiply(output, this.getTranslationMatrix(), this.getRotationMatrix());
        mat4.multiply(output, output, this.getScaleMatrix());
        return output;
    }

    getTransformCustomScale(s: number): mat4 {
        var output = mat4.create();
        mat4.multiply(output, this.getTranslationMatrix(), this.getRotationMatrix());
        mat4.multiply(output, output, this.getScaleMatrixCustom(s));
        return output;
    }
}