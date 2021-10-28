import * as internal from "assert";
import { mat3, vec3 } from "gl-matrix";
import { mat4 } from "gl-matrix";

let PI = 3.14159265359;

function toRad(degrees: number){
  return degrees * PI / 180.0;
}

class Turtle {
    position: vec3 = vec3.create();
    forward:  vec3 = vec3.create();
    up:       vec3 = vec3.create();
    right:    vec3 = vec3.create();
    scale:    vec3 = vec3.create();
    recursive_depth: number;
    id: number;
    moveAmt: number;

    constructor(id: number) {
        this.position = vec3.fromValues(0, -10, -20);
        this.forward =  vec3.fromValues(0, 0, 1);
        this.right =    vec3.fromValues(1, 0, 0);
        this.up =       vec3.fromValues(0, 1, 0);
        this.scale =    vec3.fromValues(0.3, 0.5, 0.3);
        this.recursive_depth = 0;
        this.id = id;
        this.moveAmt = 0.5;
    }

    duplicate(id: number){
        let newTurtle = new Turtle(id);
        vec3.copy(newTurtle.position, this.position);
        vec3.copy(newTurtle.forward, this.forward);
        vec3.copy(newTurtle.up, this.up);
        vec3.copy(newTurtle.right, this.right);
        vec3.copy(newTurtle.scale, this.scale);
        newTurtle.recursive_depth = this.recursive_depth + 1;
        newTurtle.moveAmt = this.moveAmt;
        return newTurtle;
    }

    getBasis(){
        return mat4.fromValues(this.right[0],   this.right[1],   this.right[2],   0,
                               this.up[0],      this.up[1],      this.up[2],      0,
                               this.forward[0], this.forward[1], this.forward[2], 0,
                               0,               0,               0,               1);    
    }

    setBasis(newBasis: mat4){
        if (!newBasis) return;
        this.right =   vec3.fromValues(newBasis[0], newBasis[1], newBasis[2]);
        this.up =      vec3.fromValues(newBasis[4], newBasis[5], newBasis[6]);
        this.forward = vec3.fromValues(newBasis[8], newBasis[9], newBasis[10]);
    }

    rotateX(amt: number) {
        let result = mat4.create();
        let turtleBasis = this.getBasis();
        mat4.rotateX(result, turtleBasis, toRad(amt));
        this.setBasis(result);
    }

    rotateY(amt: number) {
        let result = mat4.create();
        let turtleBasis = this.getBasis();
        mat4.rotateY(result, turtleBasis, toRad(amt));
        this.setBasis(result);
    }

    rotateZ(amt: number) {
        let result = mat4.create();
        let turtleBasis = this.getBasis();
        //console.log("turtle basis: " + mat4.str(turtleBasis));
        mat4.rotateZ(result, turtleBasis, toRad(amt));
       // console.log("Rotated:" + mat4.str(result));
        this.setBasis(result);
    }

    move() {
        const offset = vec3.fromValues(this.up[0] * this.moveAmt, this.up[1] * this.moveAmt, this.up[2] * this.moveAmt);
        vec3.add(this.position, this.position, offset);
        //console.log("Moving along this vector: " + vec3.str(this.up));
    }

    scaleXZ(scale: number) {
        vec3.multiply(this.scale, vec3.fromValues(scale, 1, scale), this.scale);
    }

    scaleMoveAmt(scale: number){
        this.moveAmt *= scale;
        vec3.multiply(this.scale, vec3.fromValues(1, scale, 1), this.scale);
    }

    transform() {
        let rotationMat = this.getBasis();

        let translationMat = mat4.fromValues(1, 0, 0, 0,
                                             0, 1, 0, 0,
                                             0, 0, 1, 0, 
                                             this.position[0], this.position[1], this.position[2], 1);

        let scaleMat = mat4.fromValues(this.scale[0], 0, 0, 0,
                                       0, this.scale[1], 0, 0,
                                       0, 0, this.scale[2], 0, 
                                       0, 0, 0, 1)
        let result = mat4.create();
        mat4.multiply(result, rotationMat, scaleMat);
        mat4.multiply(result, translationMat, result);
        return result;
    }
};

export default Turtle;