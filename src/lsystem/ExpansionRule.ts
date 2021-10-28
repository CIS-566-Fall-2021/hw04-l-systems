// ExpansionRule represents the result of mapping a particular character to a new set of characters 
// during the grammar expansion phase of the L-System
import * as ran from 'ranjs';

export default class ExpansionRule {
    output: string;
    prob: number;
    seed: number;

    expansionProbs: Map<string, number> = new Map();

    constructor(expansionProbs: Map<string, number>, seed: number) {
        this.expansionProbs = expansionProbs;
        this.seed = seed;
    }

    getExpansion() : string {
        let sumProb = 0.0;
        // let rand = Math.random();
        ran.core.seed(this.seed);
        let rand = ran.core.float() as number;

        for (const [expansion, prob] of this.expansionProbs) {
            sumProb += prob;
            if (rand < sumProb) {
                return expansion;
            }
        }

        return null;
    }
}