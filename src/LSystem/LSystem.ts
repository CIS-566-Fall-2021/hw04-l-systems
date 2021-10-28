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

    constructor(randomness: number, iterations: number, angle: number) {
        this.iterations = iterations;
        this.axiom = 'CCCC(&[-----A]CC(&[&&&&&+++++A]CC(&[-----A]CC(&[&&&&+++++A]CCF'
        this.addStringMapping();
        this.drawing = new DrawingRule(angle, randomness);
        let lstring: LString = new LString(this.axiom, this.expansion, this.iterations);
        this.fullstring = lstring.getInstructions();
    }   

    addStringMapping() {
        this.expansion = new ExpansionRule();
        this.expansion.addRule('A', '))))C^C[^B]&&C[((((((((((B]&&C[^B]C^^^^F');
        this.expansion.addRule('B', '+CD+C[++(CCBD][--)CCB]+CD+C[++(CCBD][--)CCBD]');
        this.expansion.addRule('C', 'CEE');
        this.expansion.addRule('D', 'C[--^^DEED][++&&DEED][DEED]++&&((C[--^^DEED][++&&DEED][DEED]');
        this.expansion.addRule('F', '&&(((((([A](((((([A](((((([A](((((([A]');
        this.expansion.addRule('G', 'CG[++D]^^CG[--D]');
    }

    buildInstances() {
        let off: vec3[] = [];
        let rot: vec4[] = [];
        let sca: number[] = [];
        let type: boolean[] = [];
        let tup: [vec3[], vec4[], number[], boolean[]] = [off, rot, sca, type];

        for (let i = 0; i < this.fullstring.length; i++) {
            let c: string = this.fullstring.charAt(i);
            let t: Turtle = this.drawing.caseOnChar(c);
            if (t != null) {
                off.push(t.getOffset());
                rot.push(t.getQuat());
                sca.push(6 / (2 * Math.pow(2, t.iterations) + t.position[1]/ 50));

                if (c == 'D') {
                    type.push(false);
                } else {
                    type.push(true);
                }
            }
        }
        return tup;
    }
}

export default LSystem