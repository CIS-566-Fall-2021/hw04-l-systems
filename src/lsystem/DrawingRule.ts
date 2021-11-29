// DrawingRule represents the result of mapping a character to an L-System drawing operation

import {vec3, vec4, mat4} from 'gl-matrix';

export default class DrawingRule {
    drawFunc: any; // Function that draws the turtle
    prob: number; // Probability that the symbol is mapped to this function

    constructor(drawFunc: any, prob: number) {
        this.drawFunc = drawFunc;
        this.prob = prob;
    }
}