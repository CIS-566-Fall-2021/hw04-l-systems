import {vec3, vec4, mat4} from 'gl-matrix';
import LSystem from './LSystem';
import ExpansionRule from './ExpansionRule';
// import { random } from 'gl-matrix/src/gl-matrix/vec2';
import * as ran from 'ranjs';

export default class Plant {
    lsystem: LSystem;
    depth: number
    positions: vec4[] = new Array();
    transformationMats: mat4[] = new Array();
    leafTransformationMats: mat4[] = new Array();
    appleTransformationMats: mat4[] = new Array();
    angle: number

    // Procedural controls
    seed: number
    branchThickness: number

    constructor(axiom: string, depth: number, angle: number, seed: number, branchThickness: number) {
        this.lsystem = new LSystem(axiom, branchThickness);
        this.depth = depth;
        this.angle = angle;

        this.seed = seed;
        ran.core.seed(seed);
        this.branchThickness = branchThickness;
    }

    drawForward() {
        let turtle = this.lsystem.currTurtle;
        turtle.isLeaf = false;
        turtle.isApple = false;

        let turtlePos = vec4.fromValues(turtle.pos[0], turtle.pos[1], turtle.pos[2], turtle.pos[3]);
        let transformMat = turtle.getTransformationMatrix();
        this.positions.push(turtlePos);
        this.transformationMats.push(transformMat);
        turtle.moveForward(0.38);
    }

    drawLeaf() {
        let turtle = this.lsystem.currTurtle;

        turtle.isLeaf = true;
        turtle.isApple = false;

        let transformMat = turtle.getTransformationMatrix();
        let I = mat4.create();
        mat4.identity(I);
        let randomRotation = mat4.create();
        let random = ran.core.float() as number;
        mat4.rotateX(randomRotation, I, random * 30);
        mat4.rotateY(randomRotation, randomRotation, random * 30);
        mat4.rotateZ(randomRotation, randomRotation, random * 30);
        
        mat4.multiply(transformMat, transformMat, randomRotation);
        this.leafTransformationMats.push(transformMat);
    }

    drawApple() {
        let turtle = this.lsystem.currTurtle;

        turtle.isLeaf = false;
        turtle.isApple = true;

        // Variable that controls density of apples
        let appleDensity = 0.15;
        
        if (ran.core.float() as number < appleDensity) {
            let transformMat = turtle.getTransformationMatrix();
            let I = mat4.create();
            mat4.identity(I);
            let randomRotation = mat4.create();
            mat4.rotateX(randomRotation, I, 4.0 * Math.PI / 3.0);
            mat4.multiply(transformMat, transformMat, randomRotation);
            this.appleTransformationMats.push(transformMat);
        }
    }

    drawNothing() {}

    rotateUpPos() {
        let turtle = this.lsystem.currTurtle;
        // Rotate about the up vector
        turtle.rotate(this.angle, vec3.fromValues(turtle.up[0], turtle.up[1], turtle.up[2]));
    }

    rotateUpNeg() {
        let turtle = this.lsystem.currTurtle;
        // Rotate about the up vector
        turtle.rotate(-this.angle, vec3.fromValues(turtle.up[0], turtle.up[1], turtle.up[2]));
    }

    rotateForwardPos() {
        let turtle = this.lsystem.currTurtle;
        // Rotate about the forward vector
        turtle.rotate(this.angle, vec3.fromValues(turtle.forward[0], turtle.forward[1], turtle.forward[2]));
    }

    rotateForwardNeg() {
        let turtle = this.lsystem.currTurtle;
        // Rotate about the forward vector
        turtle.rotate(-this.angle, vec3.fromValues(turtle.forward[0], turtle.forward[1], turtle.forward[2]));
    }

    rotateRightPos() {
        let turtle = this.lsystem.currTurtle;
        // Rotate about the right vector
        turtle.rotate(this.angle, vec3.fromValues(turtle.right[0], turtle.right[1], turtle.right[2]));
    }

    rotateRightNeg() {
        let turtle = this.lsystem.currTurtle;
        // Rotate about the right vector
        turtle.rotate(-this.angle, vec3.fromValues(turtle.right[0], turtle.right[1], turtle.right[2]));
    }

    rotateRandom15() {
        let turtle = this.lsystem.currTurtle;
        // Choose a random angle ranging from -15 to 15        
        let randomAngle = ran.core.float(-15, 15) as number;
        turtle.rotate(randomAngle, vec3.fromValues(turtle.right[0], turtle.right[1], turtle.right[2]));
        turtle.rotate(randomAngle, vec3.fromValues(turtle.up[0], turtle.up[1], turtle.up[2]));
    }

    rotateRandom5() {
        let turtle = this.lsystem.currTurtle;
        // Choose a random angle ranging from -5 to 5
        let randomAngle = ran.core.float(-5, 5) as number;
        turtle.rotate(randomAngle, vec3.fromValues(turtle.right[0], turtle.right[1], turtle.right[2]));
        turtle.rotate(randomAngle, vec3.fromValues(turtle.up[0], turtle.up[1], turtle.up[2]));
    }

    saveTurtle() {
        this.lsystem.saveTurtle();
    }

    resetTurtle() {
        this.lsystem.resetTurtle();
    }

    setDrawingRules() {
        this.lsystem.addDrawingRule("T", this.drawForward.bind(this), 1.0);
        this.lsystem.addDrawingRule("F", this.drawForward.bind(this), 1.0);
        this.lsystem.addDrawingRule("X", this.drawNothing.bind(this), 1.0);
        this.lsystem.addDrawingRule("L", this.drawLeaf.bind(this), 1.0);
        this.lsystem.addDrawingRule("A", this.drawApple.bind(this), 1.0);

        this.lsystem.addDrawingRule("+", this.rotateUpPos.bind(this), 0.5);
        this.lsystem.addDrawingRule("-", this.rotateUpNeg.bind(this), 1.0);
        this.lsystem.addDrawingRule("!", this.rotateForwardPos.bind(this), 1.0);
        this.lsystem.addDrawingRule("@", this.rotateForwardNeg.bind(this), 1.0);
        this.lsystem.addDrawingRule("#", this.rotateRightPos.bind(this), 1.0);
        this.lsystem.addDrawingRule("$", this.rotateRightNeg.bind(this), 1.0);
        this.lsystem.addDrawingRule("%", this.rotateRandom15.bind(this), 1.0);
        this.lsystem.addDrawingRule("^", this.rotateRandom5.bind(this), 1.0);

        this.lsystem.addDrawingRule("[", this.saveTurtle.bind(this), 1.0);
        this.lsystem.addDrawingRule("]", this.resetTurtle.bind(this), 1.0);
    }

    setExpansionRules() {
        let T_map = new Map([["T", 1.0]]);
        this.lsystem.addExpansionRule("T", new ExpansionRule(T_map, this.seed));
        
        let F_map = new Map([
            ["FF", 0.1],
            ["F^", 0.8],
            ["F", 0.1],
        ]);
        this.lsystem.addExpansionRule("F", new ExpansionRule(F_map, this.seed));

        let X_map = new Map([
            ["FFFF[+FFLXL]FF[#FFXLA]FLFL[$FFLXL]FF[-FFLXL]FFXLA", 1.0],
        ]);
        this.lsystem.addExpansionRule("X", new ExpansionRule(X_map, this.seed));

        let L_map = new Map([
            ["L", 1.0],
        ]);
        this.lsystem.addExpansionRule("L", new ExpansionRule(L_map, this.seed));

        let A_map = new Map([
            ["A", 1.0],
            // ["", 1.0],
        ]);
        this.lsystem.addExpansionRule("A", new ExpansionRule(A_map, this.seed));

        let rotateUpPos_map = new Map([["+", 1.0]]);
        this.lsystem.addExpansionRule("+", new ExpansionRule(rotateUpPos_map, this.seed));
        let rotateUpNeg_map = new Map([["-", 1.0]]);
        this.lsystem.addExpansionRule("-",new ExpansionRule(rotateUpNeg_map, this.seed));
        let rotateForwardPos_map = new Map([["!", 1.0]]);
        this.lsystem.addExpansionRule("!", new ExpansionRule(rotateForwardPos_map, this.seed));
        let rotateForwardNeg_map = new Map([["@", 1.0]]);
        this.lsystem.addExpansionRule("@", new ExpansionRule(rotateForwardNeg_map, this.seed));
        let rotateRightPos_map = new Map([["#", 1.0]]);
        this.lsystem.addExpansionRule("#", new ExpansionRule(rotateRightPos_map, this.seed));
        let rotateRightNeg_map = new Map([["$", 1.0]]);
        this.lsystem.addExpansionRule("$", new ExpansionRule(rotateRightNeg_map, this.seed));
        let rotateRandom30_map = new Map([["%", 1.0]]);
        this.lsystem.addExpansionRule("%", new ExpansionRule(rotateRandom30_map, this.seed));
        let rotateRandom10_map = new Map([["^", 1.0]]);
        this.lsystem.addExpansionRule("^", new ExpansionRule(rotateRandom10_map, this.seed));

        let save_map = new Map([["[", 1.0]]);
        this.lsystem.addExpansionRule("[",new ExpansionRule(save_map, this.seed));
        let reset_map = new Map([["]", 1.0]]);
        this.lsystem.addExpansionRule("]", new ExpansionRule(reset_map, this.seed));
    }

    create() {
        this.setDrawingRules();
        this.setExpansionRules();
        this.lsystem.expand(this.depth);
        this.lsystem.draw();
    }

}