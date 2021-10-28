// Turtle represents current drawing state of the L-System

import {vec3, vec4, mat4} from 'gl-matrix';

export default class Turtle {
    pos: vec4;
    forward: vec4;
    up: vec4;
    right: vec4;
    depth: number;
    trunkDepth: number;
    isLeaf: boolean = false;
    isApple: boolean = false;
    branchThickness: number = 0.5;

    constructor(pos: vec4, forward: vec4, right: vec4, up: vec4, depth: number, trunkDepth: number, branchThickness: number) {
        this.pos = pos;
        this.forward = forward;
        this.right = right;
        this.up = up;
        this.depth = depth;
        this.trunkDepth = trunkDepth;
        this.branchThickness = branchThickness;

    }

    moveForward(distance: number) {
        let translate = vec4.create();
        vec4.multiply(translate, this.forward, vec4.fromValues(distance, distance, distance, 1));
        vec4.add(this.pos, this.pos, translate);
        this.trunkDepth++;
    }

    rotate(angle: number, axis: vec3) {
        var rotate = mat4.create();
        angle = Math.PI / 180.0 * angle;
        mat4.fromRotation(rotate, angle, axis);
        vec4.normalize(this.up, vec4.transformMat4(this.up, this.up, rotate));
        vec4.normalize(this.right, vec4.transformMat4(this.right, this.right, rotate));
        vec4.normalize(this.forward, vec4.transformMat4(this.forward, this.forward, rotate));
    }

    getTransformationMatrix(): mat4 {
        let translate = mat4.create();
        mat4.fromTranslation(translate, vec3.fromValues(this.pos[0], this.pos[1], this.pos[2]));

        let rotate = mat4.create();
        let globalUp = vec3.fromValues(0, 1, 0);
        let forwardVec = vec3.fromValues(this.forward[0], this.forward[1], this.forward[2]);
        let theta = Math.acos(vec3.dot(globalUp, forwardVec) / (vec3.length(globalUp) * vec3.length(forwardVec)));
        let rotationAxis = vec3.create();
        vec3.cross(rotationAxis, globalUp, forwardVec);
        mat4.fromRotation(rotate, theta, rotationAxis);

        
        let scale = mat4.create();
        // if the turtle represents a leaf or apple, do not scale
        if (this.isLeaf || this.isApple) {
            
            scale = mat4.identity(scale);

        } else {
            
            let turtleScale = 2.0 * Math.pow(this.branchThickness, .75 * this.depth);
            // If the turtle is part of the trunk, use the trunk depth to scale it down
            if (this.depth < 2) {
                turtleScale = 2.0 * Math.pow(this.branchThickness, 0.05* this.trunkDepth);
            }
            mat4.fromScaling(scale, vec3.fromValues(turtleScale, 1.0, turtleScale));
        }

        let transform = mat4.create();
        mat4.multiply(transform, translate, rotate);
        mat4.multiply(transform, transform, scale);

        return transform;
    }

    incrDepth(){
        this.depth++;
    }

    resetTrunkDepth() {
        this.trunkDepth = 0;
    }
}
