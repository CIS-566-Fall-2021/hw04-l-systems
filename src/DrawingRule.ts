import {vec3, mat4, quat} from 'gl-matrix';
import Turtle from "./Turtle";

export default class DrawingRule {
    turtleStack: Turtle[];
    turtle: Turtle;
    drawingRules: Map<string, any> = new Map<string, any>();
    angle: number;
    branches: mat4[] = [];
    leaves: mat4[] = [];

    constructor(a: number) {
        this.angle = a;
        this.turtle = new Turtle(vec3.fromValues(0,0,0), vec3.fromValues(0,1,0), quat.fromValues(0,0,0,1), this.angle, vec3.fromValues(1,1,1), 0);
        this.turtleStack = [];
        this.drawingRules.set("F", this.turtle.moveForward.bind(this.turtle));
        this.drawingRules.set("L", this.turtle.drawLeaf.bind(this.turtle));
        this.drawingRules.set("=", this.turtle.rotateYUp.bind(this.turtle));
        this.drawingRules.set("~", this.turtle.rotateXUp.bind(this.turtle));
        this.drawingRules.set("+", this.turtle.rotateZUp.bind(this.turtle));
        this.drawingRules.set("_", this.turtle.rotateYDown.bind(this.turtle));
        this.drawingRules.set("*", this.turtle.rotateXDown.bind(this.turtle));
        this.drawingRules.set("-", this.turtle.rotateZDown.bind(this.turtle));
    }

    push() {
        let position: vec3 = vec3.create();
        vec3.copy(position, this.turtle.position);

        let orientation: vec3 = vec3.create();
        vec3.copy(orientation, this.turtle.orientation);

        let quaternion: quat = quat.create();
        quat.copy(quaternion, this.turtle.quaternion);

        let scale: vec3 = vec3.create();
        vec3.copy(scale, this.turtle.scale);

        let newT : Turtle = new Turtle(position, orientation, quaternion, this.turtle.angle, scale, this.turtle.depth);
        this.turtleStack.push(newT);
    }

    draw(axiom: string) {
        for (let i: number = 0; i < axiom.length; i++) {
            let currentRule: string = axiom[i];
            let drawRule: any = this.drawingRules.get(currentRule);
            if (currentRule == "[")  this.push();
            if (currentRule == "]")  {
                let topTurtle : Turtle = this.turtleStack.pop();
                if (topTurtle) {
                    this.turtle.position = topTurtle.position;
                    this.turtle.angle = topTurtle.angle;
                    this.turtle.orientation = topTurtle.orientation;
                    this.turtle.quaternion = topTurtle.quaternion;
                    this.turtle.scale = topTurtle.scale;
                    this.turtle.depth++;
                }
            }
            if (drawRule) {
                drawRule();
                if (currentRule == 'L')  this.leaves.push(this.turtle.getLeafTransform());
                else if (currentRule == 'F') {
                    if (this.turtle.scale[0] > 0.02) { this.turtle.scale[0] *= 0.93; this.turtle.scale[1] *= 0.99; this.turtle.scale[2] *= 0.95;}
                    this.branches.push(this.turtle.getTransform());
                }
            }
        }
    }
}