export default class ExpansionRule {
    grammar: Map<string, Array<[string, number]>> = new Map<string, Array<[string, number]>>();

    constructor() {
        this.grammar.set("X", [["FFFFFFL[++FFFL-FLF=FLFX*FFL_FFX][-~F*FFLX[X[XL]]]L", 1.0]]);
    }

    expand(axiom: string, iterations: number) : string {
        let final: string = axiom;

        for (let i: number = 0; i < iterations; i++) {
            let curIter: string = "";

            for (let j: number = 0; j < final.length; j++) {
                let curChar: string = final.charAt(j);

                if (!this.grammar.has(curChar)) {
                    curIter += curChar;
                    continue;
                }

                let ans: string = "";
                if (this.grammar.has(curChar)) {
                    let num: number = 0;
                    let curStr = this.grammar.get(curChar);
        
                    for (let i: number = 0; i < curStr.length; i++) {
                        num += curStr[i][1];
        
                        if (Math.random() <= num) {
                            ans += curStr[i][0];
                            break;
                        }
                    }
                }

                curIter += ans;
            }
            final = curIter;
        }
        return final;
    }
}