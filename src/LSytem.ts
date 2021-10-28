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

export default class LSystem {
    axiom: string;
    depth: number;
    cachedSentence: string;
    grammar: Map<string, ExpansionRule>;
    
    curTurt: Turtle;
    turtleStack: Array<Turtle> = new Array();

    rand: Function;

    constructor(axiom: string, iterations: number, seed: string) {
        this.axiom = axiom;
        this.depth = iterations;

        this.grammar = new Map([
            ["F", new ExpansionRule(new Map([
                [1.0, "FX"],
            ]))],
            ["X", new ExpansionRule(new Map([
                [1.0, "X"],
            ]))],
        ]);

        let initTurt = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
        this.curTurt = initTurt;

        let randomizer = new Random(seed);
        this.rand = randomizer.rand();
    }

    expand(s: string) {
        let sentence = s;
        // console.log("expand() - sentence", sentence);
        for (let i = 0; i < this.depth; i++) {
            let expandedSentence: Array<String> = [];
            for (let j = 0; j < sentence.length; j++) {
                let c = sentence[j]
                // let c = sentenceList[j]
                if (this.grammar.has(c)) {
                    // let randRule = Math.random();
                    let randRule = this.rand();
                    let expansion = this.grammar.get(c).getExpansion(randRule);
                    
                    expandedSentence.push(expansion);
                }
            }

            sentence = expandedSentence.join("")
        }
        this.cachedSentence = sentence;
        return sentence;
    }

    push(t: Turtle) {
        this.turtleStack.push(t);
    }

    pop(): Turtle {
        return this.turtleStack.pop();
    }
}