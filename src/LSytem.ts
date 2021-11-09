import Turtle from './Turtle.ts'
import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
import Random from './Random.ts'

export class ExpansionRule {
    probs: Array<number>;
    rules: Array<String>;
    
    constructor(expansions: Map<number, String>) {
        this.probs = Array.from(expansions.keys());
        this.rules = Array.from(expansions.values());
        // this.probs = probs;
        // this.rules = rules;
    }

    getExpansion(p: number) {
        let cum = 0;
        for (let i = 0; i < this.probs.length - 1; i++) {
            cum += this.probs[i];
            if (p < cum) {
                return this.rules[i];
            }
        }
        // tested against all other interval "buckets"
        return this.rules[this.rules.length - 1]
    }
}

export class DrawingRule {
    turtle: Turtle;
    stack: Array<Turtle> = new Array();
    angle: number;
    dist: number;
    rand: Function;

    constructor(angle: number, dist: number) {
        let initTurt = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0), 1, 0);
        this.turtle = initTurt;
        this.angle = angle;
        this.dist = dist;

        let randomizer = new Random("banana");
        this.rand = randomizer.rand();
    }

    rotateTurtle(axis: vec3, angle: number) {
        let rand = this.rand();
        // let x = this.rand() * 10 - 5;
        // let y = this.rand() * 10 - 5;
        // let z = this.rand() * 10 - 5;
        // console.log(x, y, z);
        // let newAxis = vec3.fromValues(axis[0] + x, axis[1] + y, axis[2] + z);
        this.turtle.rotate(axis, angle);
    }

    read(c: string): Turtle {
        if (c.length == 1) {
            // console.log("drawing rule reading", c)
            switch (c) {
                case "[":
                    let newTurtle = this.turtle.copy();
                    newTurtle.depth += 1;
                    this.stack.push(newTurtle)
                    break;
                case "]":
                    this.turtle = this.stack.pop();
                    break;
                case ('+'):
                    this.rotateTurtle(vec3.fromValues(1., 0., 0.), this.angle);
                    break;
                case ('-'):
                    this.rotateTurtle(vec3.fromValues(-1., 0., 0.), this.angle);
                    break;
                case ('&'):
                    this.rotateTurtle(vec3.fromValues(0., 1., 0.), this.angle);
                    break;
                case ('^'):
                    this.rotateTurtle(vec3.fromValues(0., -1., 0.), this.angle);
                    break;
                case ('('):
                    this.rotateTurtle(vec3.fromValues(0., 0., 1.), this.angle);
                    break;
                case (')'):
                    this.rotateTurtle(vec3.fromValues(0., 0., -1.), this.angle);
                    break;
                case ('H'):
                    return this.turtle.moveForward(this.dist / 2.0);
                    break;
                default:
                    // console.log("arrived at default", c)
                    return this.turtle.moveForward(this.dist);
                    break;
            }
        }
        return null;
    }
}

export class InstanceData {
    offsets: Array<vec3>;
    rotations: Array<vec4>;
    scales: Array<number>;
    leaf: Array<boolean>;
    constructor(offsets: Array<vec3>, rotations: Array<vec4>, scales: Array<number>, leaf: Array<boolean>) {
        this.offsets = offsets;
        this.rotations = rotations;
        this.scales = scales;
        this.leaf = leaf;
    }
}

export default class LSystem {
    axiom: string;
    depth: number;
    angle: number;
    dist: number;
    cachedSentence: string;
    grammar: Map<string, ExpansionRule>;
    drawingRule: DrawingRule;

    rand: Function;

    constructor(axiom: string, iterations: number, angle: number, dist: number, seed: string) {
        this.axiom = axiom;
        this.depth = iterations;
        this.angle = angle;
        this.dist = dist;

        let defGrammar = new Map([
            ["F", new ExpansionRule(new Map([
                [1.0, "FX"],
            ]))],
            ["X", new ExpansionRule(new Map([
                [1.0, "X+"],
            ]))],
        ]);
        this.setGrammarRules(defGrammar);
        this.drawingRule = new DrawingRule(angle, dist);

        let randomizer = new Random(seed);
        this.rand = randomizer.rand();
    }

    setGrammarRules(rules: Map<string, ExpansionRule>) {
        this.grammar = rules;
    }

    expandOnce(s: string) {
        let expandedSentence: Array<String> = [];
        for (let j = 0; j < s.length; j++) {
            let c = s[j]
            if (this.grammar.has(c)) {
                // let randRule = Math.random();
                // console.log(randRule)
                let randRule = this.rand() * 4;
                let expansion = this.grammar.get(c).getExpansion(randRule);
                if (randRule < 1) {
                    expansion.concat("+++")
                } else if (randRule < 2) {
                    expansion.concat("^^))-")
                } else if (randRule < 3) {
                    expansion.concat("(++^^")
                } else if (randRule < 4) {
                    expansion.concat("-&-)))")
                }
                
                expandedSentence.push(expansion);
            } else {
                expandedSentence.push(c);
            }
        }
        return expandedSentence.join("");
    }

    expand(s: string) {
        // let newSentence = "";
        let sentence = s;
        // console.log("expand() - sentence", sentence);
        for (let i = 0; i < this.depth; i++) {
            // let expandedSentence: Array<String> = [];
            // for (let j = 0; j < sentence.length; j++) {
            //     let c = sentence[j]
            //     // let c = sentenceList[j]
            //     if (this.grammar.has(c)) {
            //         // let randRule = Math.random();
            //         let randRule = this.rand();
            //         let expansion = this.grammar.get(c).getExpansion(randRule);
                    
            //         expandedSentence.push(expansion);
            //     }
            // }

            // sentence = expandedSentence.join("");
            sentence = this.expandOnce(sentence);
        }
        this.cachedSentence = sentence;
        return sentence;
    }

    instanceData(sentence: string): InstanceData {
        let off: vec3[] = [];
        let rot: vec4[] = [];
        let sca: number[] = [];
        let leaf: boolean[] = [];

        for (let i = 0; i < sentence.length; i++) {
            // console.log(this.drawingRule.stack.length)
            // let c: string = this.cachedSentence.charAt(i);
            let c: string = sentence[i];
            // console.log("char", c)
            let t: Turtle = this.drawingRule.read(c);
            if (t != null) {
                // t.logAtts();
                off.push(t.getOffset());
                rot.push(t.getQuat());
                sca.push(6 / (4 * Math.pow(1.05, t.depth)));
                // sca.push(t.scale);

                if (c == 'Z') {
                    leaf.push(true);
                } else {
                    leaf.push(false);
                }
            }
        }
        return new InstanceData(off, rot, sca, leaf);
    }
}