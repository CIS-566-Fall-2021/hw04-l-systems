import ExpansionRule from "./ExpansionRule";
import DrawingRule from "./DrawingRule";
import LString from "./LString";
import {vec3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import Turtle from "./Turtle";
class LSystem {
    axiom: string;
    iterations: number;
    expansion: ExpansionRule;
    drawing: DrawingRule;
    fullstring: string;

    constructor() {
        this.iterations = 2;
        this.axiom = 'AA[+AB][-AB]'
        this.addStringMapping();
        this.drawing = new DrawingRule();
        let lstring: LString = new LString(this.axiom, this.expansion, this.iterations);
        this.fullstring = lstring.getInstructions();
    }   

    addStringMapping() {
        this.expansion = new ExpansionRule();
        this.expansion.addRule('A', 'AA');
        this.expansion.addRule('B', '[+AB][-AB]');
    }

    buildInstances() {
        let off: vec3[] = [];
        let rot: vec4[] = [];
        let tup: [vec3[], vec4[]] = [off, rot];

        for (let i = 0; i < this.fullstring.length; i++) {
            let c: string = this.fullstring.charAt(i);
            let t: Turtle = this.drawing.caseOnChar(c);
            if (t != null) {
                off.push(t.getOffset());
                rot.push(t.getQuat());
            }
        }
        return tup;
    }
}

export default LSystem