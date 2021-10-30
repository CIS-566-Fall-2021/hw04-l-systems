import {mat4} from 'gl-matrix';
import DrawingRule from './DrawingRule';
import ExpansionRule from './ExpansionRule';

export default class LSystem {
    axiom: string;
    expansionRules: ExpansionRule;
    drawingRules: DrawingRule;
    iterations : number
    branches: mat4[];
    leaves: mat4[];
    angle: number;

    constructor(axiom: string, iterations: number, a: number) {
        this.axiom = axiom;
        this.angle = a;
        this.expansionRules = new ExpansionRule();
        this.iterations = iterations;
        this.drawingRules = new DrawingRule(this.angle);
        this.drawingRules.draw(this.expansionRules.expand(this.axiom, this.iterations));
        this.branches = this.drawingRules.branches;
        this.leaves = this.drawingRules.leaves;
    }
}