import { vec3, mat4, quat } from 'gl-matrix';

// Help Functions
function radians(degree: number) {
    return degree * Math.PI / 180;
}

function rotationNoise(variation: number) {
    return (2 * Math.random() - 1) * variation;
}

// Turtle Class
export class Turtle {
    position: vec3;
    orientEuler: vec3;
    orientQuat: quat;
    depth: number;
    angle: number;
    branchRadius: number;

    constructor(position: vec3, orientEuler: vec3, orientQuat: quat,
        depth: number, angle: number, branchRadius: number) {
        this.position = position;
        this.orientEuler = orientEuler;
        this.orientQuat = orientQuat;
        this.depth = depth;
        this.angle = angle;
        this.branchRadius = branchRadius;
    }

    UpdateOrientQuat() {
        quat.rotationTo(this.orientQuat, vec3.fromValues(0, 1, 0), this.orientEuler);
        quat.normalize(this.orientQuat, this.orientQuat);
    }

    moveForward() {
        vec3.add(this.position, this.position, this.orientEuler);
    }

    rotate(q: quat) {
        this.orientEuler = vec3.transformQuat(this.orientEuler, this.orientEuler, q);
        this.UpdateOrientQuat();
    }

    rotateAroundX() {
        let q = quat.create();
        quat.setAxisAngle(q, vec3.fromValues(1, 0, 0), radians(this.angle + rotationNoise(10)));
        this.rotate(q);
    }

    rotateAround_X() {
        let q = quat.create();
        quat.setAxisAngle(q, vec3.fromValues(1, 0, 0), -radians(this.angle + rotationNoise(10)));
        this.rotate(q);
    }

    rotateAroundY() {
        let q = quat.create();
        quat.setAxisAngle(q, vec3.fromValues(0, 1, 0), radians(this.angle + rotationNoise(10)));
        this.rotate(q);
    }

    rotateAround_Y() {
        let q = quat.create();
        quat.setAxisAngle(q, vec3.fromValues(0, 1, 0), -radians(this.angle + rotationNoise(10)));
        this.rotate(q);
    }

    rotateAroundZ() {
        let q = quat.create();
        quat.setAxisAngle(q, vec3.fromValues(0, 0, 1), radians(this.angle + rotationNoise(10)));
        this.rotate(q);
    }

    rotateAround_Z() {
        let q = quat.create();
        quat.setAxisAngle(q, vec3.fromValues(0, 0, 1), -radians(this.angle + rotationNoise(10)));
        this.rotate(q);
    }
}

// ExpansionRule Class
export class ExpansionRule {
    grammar1: Map<string, string> = new Map();
    grammar2: Map<string, string> = new Map();
    grammar3: Map<string, string> = new Map();

    constructor() {
        this.grammar1.set("F", "FF");
        this.grammar2.set("F", "FF");
        this.grammar3.set("F", "FF");
        this.grammar1.set("X", "F[7FLXL]3FLX9FLXLL[2FLX]FL");
        this.grammar2.set("X", "F[2LFLX]8FL1FLX[7FLLX]");
        this.grammar3.set("X", "F[1FLX]L9FXLFLX[3FLX]");
    }

    expand(axiom: string, iterations: number) {
        let final = axiom;
        for (let i = 0; i < iterations; i++) {
            let cur: string = "";
            for (let j = 0; j < final.length; j++) {
                let symbol = final[j];
                if (symbol == "F" || symbol == "X") {
                    let random = Math.random();
                    if (random < 0.33) {
                        cur += this.grammar1.get(symbol);
                    }
                    else if (random < 0.66) {
                        cur += this.grammar2.get(symbol);
                    }
                    else {
                        cur += this.grammar3.get(symbol);
                    }
                }
                else {
                    cur += symbol;
                }
            }
            final = cur;
        }
        return final;
    }
}

// DrawRule Class
export class DrawingRule {
    drawRules: Map<string, any> = new Map();
    turtles: Turtle[] = [];
    turtle: Turtle;
    branchcesTransform: mat4[] = [];
    leavesTransform: mat4[] = [];

    constructor(angle: number) {
        this.turtle = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0), quat.create(), 0, angle, 1);

        this.drawRules.set("F", this.turtle.moveForward.bind(this.turtle));

        this.drawRules.set("1", this.turtle.rotateAroundZ.bind(this.turtle));
        this.drawRules.set("9", this.turtle.rotateAround_Z.bind(this.turtle));
        this.drawRules.set("2", this.turtle.rotateAroundY.bind(this.turtle));
        this.drawRules.set("8", this.turtle.rotateAround_Y.bind(this.turtle));
        this.drawRules.set("3", this.turtle.rotateAroundX.bind(this.turtle));
        this.drawRules.set("7", this.turtle.rotateAround_X.bind(this.turtle));
    }

    draw(expansion: string) {
        for (let i = 0; i < expansion.length; i++) {
            let symbol = expansion[i];
            let func = this.drawRules.get(symbol);

            if (func) {
                func();
            }
            if (symbol == 'F') {
                this.turtle.branchRadius *= 0.98;
                if (this.turtle.branchRadius < 0.1) {
                    this.turtle.branchRadius = 0.1;
                }
                let curBranchTransform: mat4 = mat4.create();
                mat4.fromRotationTranslationScale(curBranchTransform, this.turtle.orientQuat,
                    this.turtle.position, vec3.fromValues(this.turtle.branchRadius, 1, this.turtle.branchRadius));
                this.branchcesTransform.push(curBranchTransform);
            }
            else if (symbol == 'L') {
                let q: quat = quat.create();
                let curLeafTransform: mat4 = mat4.create();
                quat.fromEuler(q, rotationNoise(180), rotationNoise(180), rotationNoise(180))
                mat4.fromRotationTranslationScale(curLeafTransform, q, this.turtle.position, vec3.fromValues(1, 1, 1));
                this.leavesTransform.push(curLeafTransform);
            }
            else if (symbol == "[") {
                let position: vec3 = vec3.create();
                vec3.copy(position, this.turtle.position);

                let orientEuler: vec3 = vec3.create();
                vec3.copy(orientEuler, this.turtle.orientEuler);

                let orientQuat: quat = quat.create();
                quat.copy(orientQuat, this.turtle.orientQuat);

                this.turtles.push(new Turtle(position, orientEuler, orientQuat,
                    this.turtle.depth, this.turtle.angle, this.turtle.branchRadius));
            }
            else if (symbol == "]") {
                let removedTurtle = this.turtles.pop();
                if (removedTurtle) {
                    vec3.copy(this.turtle.position, removedTurtle.position);
                    vec3.copy(this.turtle.orientEuler, removedTurtle.orientEuler);
                    quat.copy(this.turtle.orientQuat, removedTurtle.orientQuat);
                    this.turtle.depth = removedTurtle.depth - 1;
                    this.turtle.angle = removedTurtle.angle;
                    this.turtle.branchRadius = removedTurtle.branchRadius;
                }
            }
        }
    }
}

// LSystem Class
export default class LSystem {
    axiom: string;
    iterations: number
    angle: number;
    ExpansionRule: ExpansionRule;
    DrawingRule: DrawingRule;

    constructor(axiom: string, iterations: number, angle: number) {
        this.axiom = axiom;
        this.iterations = iterations;
        this.angle = angle;
        this.ExpansionRule = new ExpansionRule();
        this.DrawingRule = new DrawingRule(this.angle);
    }

    draw() {
        this.DrawingRule.draw(this.ExpansionRule.expand(this.axiom, this.iterations));
    }
}