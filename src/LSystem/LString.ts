import ExpansionRule from "./ExpansionRule";

class LString {
    axiom: string;
    rules: ExpansionRule;
    iterations: number;
    instructions: string;

    constructor(axiom: string, rules: ExpansionRule, iterations: number) {
        this.axiom = axiom;
        this.rules = rules;
        this.iterations = iterations;

        this.instructions = axiom;
        for (let i = 0; i < iterations; i++) {
            let nextExpansion: string = "";
            for (let j = 0; j < this.instructions.length; j++) {
                let c: string = this.instructions.charAt(j);
                if (rules.has(c)) {
                    nextExpansion += rules.get(c);
                } else {
                    nextExpansion += c;
                }
            }
            this.instructions = nextExpansion;
        }
    }
    getInstructions() {
        return this.instructions;
    }
}

export default LString