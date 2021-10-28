import { vec3, vec4, mat4, quat } from 'gl-matrix';
import Turtle from './Turtle';
import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';


export default class LSystem {
    currTurtle: Turtle;
    turtleStack: Turtle[] = []; // Stack of turtles to keep track of drawing history
    drawingRules: Map<string, DrawingRule> = new Map();// Map of input strings to drawing rules
    expansionRules: Map<string, ExpansionRule> = new Map; // Map of input strings to expansion rules
    axiom: string;
    finalString: string;
    
    branchThickness: number

    constructor(axiom: string, branchThickness: number) {
        this.axiom = axiom;
        this.branchThickness = branchThickness;

        // set initial turtle to a hardcoded position
        let pos = vec4.fromValues(0, 0, 0, 1);
        let forward = vec4.fromValues(0, 1, 0, 0);
        let right = vec4.fromValues(1, 0, 0, 0);
        let up = vec4.fromValues(0, 0, 1, 0);

        this.currTurtle = new Turtle(pos, forward, right, up, 1, 0, branchThickness);
    }

    saveTurtle() {
        // Create a copy of turtle so that it doesn't get updated while in the stack
        let posCopy = vec4.fromValues(this.currTurtle.pos[0], this.currTurtle.pos[1], this.currTurtle.pos[2], this.currTurtle.pos[3]);
        let forwardCopy = vec4.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2], this.currTurtle.forward[3]);
        let rightCopy = vec4.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2], this.currTurtle.right[3]);
        let upCopy = vec4.fromValues(this.currTurtle.up[0], this.currTurtle.up[1], this.currTurtle.up[2], this.currTurtle.up[3]);
        let depthCopy = this.currTurtle.depth;
        let trunkDepthCopy = this.currTurtle.trunkDepth;
        let turtleCopy = new Turtle(posCopy, forwardCopy, rightCopy, upCopy, depthCopy, trunkDepthCopy, this.branchThickness);
        this.turtleStack.push(turtleCopy);

        this.currTurtle.incrDepth();
        this.currTurtle.resetTrunkDepth();
    }

    resetTurtle() {
        this.currTurtle = this.turtleStack.pop();
    }

    addExpansionRule(input: string, rule: ExpansionRule) {
        this.expansionRules.set(input, rule);
    }

    addDrawingRule(input: string, func: any, prob: number) {
        let rule = new DrawingRule(func, prob);
        this.drawingRules.set(input, rule);
    }

    applyExpansion(input: string) {
        var expansionRule = this.expansionRules.get(input);
        if (expansionRule == null) {
            throw 'No expansion rule for this symbol ' + input
        }
        return expansionRule.getExpansion();
    }
    
    // Recursive helper that expands on the axiom
    expandRecurse(input: string, depth: number): string {
        // Base case
        if (depth == 0) {
            return input;
        } else {
            depth = depth - 1;
            let finalString = "";
            
            for (let j = 0; j < input.length; j++) {
                let newString = this.applyExpansion(input[j]);
                finalString += newString;
            }
            return this.expandRecurse(finalString, depth);
        }
    }
    
    expand(depth: number) {
        this.finalString = this.expandRecurse(this.axiom, depth);
        console.log(this.finalString);
        return this.finalString;
    }
    
    draw() {
        for (let i = 0; i < this.finalString.length; i++) {
            var drawingRule = this.drawingRules.get(this.finalString[i]);
            if (drawingRule == null) {
                throw 'No drawing rule for this symbol'
            }
            drawingRule.drawFunc();
        }
    }
}