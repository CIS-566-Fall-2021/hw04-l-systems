import {vec3} from 'gl-matrix';

export default class DrawingRule {
    drawing: Array<[Function, number]> = new Array();

    constructor(list: Array<[Function, number]>) {
      this.drawing = list;
    }

    pickFirst(): any {
        return this.drawing[0][0]();
    }

    pickRandom(): any {
        let p: number = Math.random();
        let sum: number = 0;
        for(let i = 0; i < this.drawing.length; i++) {
            let newsum: number = sum + this.drawing[i][1];
            if (p >= sum && p < newsum) {
                // console.log("p : " + p);
                // console.log("sum : " + sum);
                // console.log("newsum : " + newsum);
                return this.drawing[i][0]();
            }
            sum = newsum;
        }
    }
}