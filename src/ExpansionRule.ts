import {vec3} from 'gl-matrix';

export default class ExpansionRule {
    expansion: Array<[string, number]> = new Array();

    constructor(list: Array<[string, number]>) {
      this.expansion = list;
    }

    pickRandom():string {
        let p: number = Math.random();
        let answer: string = "";
        let sum: number = 0;
        for(let i = 0; i < this.expansion.length; i++) {
            let newsum: number = sum + this.expansion[i][1];
            if (p >= sum && p < newsum) {
                answer = this.expansion[i][0];
                break;
            }
            sum = newsum;
        }
        return answer;
    }
}