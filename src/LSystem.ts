import Turtle from './Turtle';
import Mesh from './geometry/Mesh';
import { vec3, mat4, vec4 } from "gl-matrix";
import { throws } from 'assert';

export default class LSystem {
    iterations:             number = 0;                             // number of expansion iterations
    axiom:                  string = "";                            // beginning axiom
    drawRules:              Map<string, Array<[number, any]>> = new Map();           // rules on drawing the grammar, ex: F -> this.turtle.move()
    expansionRules :        Map<string, Array<[number, string]>> = new Map();        // rules on expanding the grammar, ex: A -> F
    expandedGrammar:        string = "";                            // expanded grammar

    cylinderTransforms:     mat4[] = [];                            // the transformation matrices for all of the cylinder instances
    leafTransforms:         mat4[] = [];                            // the transformation matrices for all of the leaf instances 
    
    turtleStack:            Turtle[] = [];                          // turtles that have been stashed for later
    turtle:                 Turtle = new Turtle(0);                 // active turtle
    numTurtles:             number = 1;                             // number of spawned turtles (used to assign ids)

    constructor(iterations: number) {
        this.iterations = iterations;
        this.turtle = new Turtle(0);
    }

    /// Expand the grammar, using the axiom and expansion rules
    expandGrammar() {
        // run n iterations, expanding each character
        let expandedGrammar = this.axiom;
        let newExpansion = "";
        for (let i = 0; i < this.iterations; ++i){
            for (let char = 0; char < expandedGrammar.length; ++char){
                let expansionRules = this.expansionRules.get(expandedGrammar[char]);
                if (expansionRules){
                    let random = Math.random();
                    for (let r = 0; r < expansionRules.length; r++){
                        let probability = expansionRules[r][0];
                        let expansion = expansionRules[r][1];
                        let replacedExpansion = "";
                        if (random < probability){
                            if (i%2 != 0){
                                for (let c = 0; c < expansion.length; c++){
                                    if (expansion[c] == "+") replacedExpansion += '8';
                                    if (expansion[c] == "-") replacedExpansion += '2';
                                    else replacedExpansion += expansion[c];
                                }
                                newExpansion += replacedExpansion;
                                break;
                            }
                            newExpansion += expansion;
                            break;
                        }
                    }
                }
                else{
                    newExpansion += expandedGrammar[char];
                }
            }
            expandedGrammar = newExpansion;
            newExpansion = "";
        }
        this.expandedGrammar = expandedGrammar;
        return expandedGrammar;
        //console.log("Grammar: " + expandedGrammar);
    }

    /// Set the expansion and draw rules
    setGrammar(angle: number, curvedBranchProb: number) {
        // set axiom
        this.axiom = "fAB";

        // set up expansion rules
        this.expansionRules.set("A", new Array<[number, string]> ([1.0, "FF"]));
        this.expansionRules.set("B", new Array<[number, string]> (
                                                                    [curvedBranchProb * 2.0, "[>/-F+fB*]f[>/+F-fB*],>AB"],
                                                                    [(curvedBranchProb * 2.0) + curvedBranchProb, "[>/-AB*]f[>/+-+B*],>AB"],
                                                                    [(curvedBranchProb * 2.0) + curvedBranchProb, "[>/-+-B*]f[>/+AB*],>AB"],
                                                                    [0.9, "[>/-AB*]f[>/+AB*],>AB"],
                                                                    [1.0, "[>/+AB*]f[>/-AB*],>AB"]
                                                                ));

        // set up drawing rules
        this.drawRules.set("F", new Array<[number, any]>(   [0.1, this.moveTurtle.bind(this, 1)],
                                                            [0.5, this.moveTurtle.bind(this, 2)], 
                                                            [1.0, this.moveTurtle.bind(this, 3)]
                                                        ));   
        this.drawRules.set("f", new Array<[number, any]>(   [0.3, this.moveTurtle.bind(this, 0)],
                                                            [1.0, this.moveTurtle.bind(this, 1)]
                                                    )); 
        this.drawRules.set("+", new Array<[number, any]>(
                                                            [1.0, this.rotateTurtleZ.bind(this, angle)]
                                                        ));
        this.drawRules.set("-", new Array<[number, any]>(
                                                            [1.0, this.rotateTurtleZ.bind(this, -angle)]
                                                        ));
        this.drawRules.set("8", new Array<[number, any]>(   [1.0, this.rotateTurtleX.bind(this, angle)]
                                                    ));
        this.drawRules.set("2", new Array<[number, any]>(
                                                            [1.0, this.rotateTurtleX.bind(this, -angle)]
                                                    ));
        this.drawRules.set("[", new Array<[number, any]>(   [1.0, this.pushTurtle.bind(this)]));
        this.drawRules.set("]", new Array<[number, any]>(   [1.0, this.popTurtle.bind(this)]));
        this.drawRules.set("/", new Array<[number, any]>(
                                                            [0.5, this.scaleTurtleHeight.bind(this, 0.85)],
                                                            [1.0, this.scaleTurtleHeight.bind(this, 0.8)]
                                                        ));
        this.drawRules.set(",", new Array<[number, any]>(
                                                            [0.5, this.scaleTurtleHeight.bind(this, 0.79)],
                                                            [1.0, this.scaleTurtleHeight.bind(this, 0.83)]
                                                        ));
        this.drawRules.set("*", new Array<[number, any]>(   [1.0, this.createLeaf.bind(this)]));
        this.drawRules.set(">", new Array<[number, any]>(   [0.5, this.scaleTurtleXZ.bind(this, 0.8)],
                                                            [1.0, this.scaleTurtleXZ.bind(this, 0.6)]
                                                        ));
    }

    /// Create the instanced cylinder, and have the turtles draw and push back their transforms
    draw(cylinder: Mesh, flower: Mesh) {
        // create instanced cylinder
        cylinder.destroy();
        flower.destroy();
        cylinder.create();
        flower.create();

        for (let i = 0; i < this.expandedGrammar.length; ++i){
            // read char in expanded grammar
            let char = this.expandedGrammar[i];

            // get & perform drawing rule func if exists
            let outcomes = this.drawRules.get(char);
            let random = Math.random();
            if (outcomes) {
                for (let r = 0; r < outcomes.length; r++){
                    if (random < outcomes[r][0]){
                        outcomes[r][1]();
                        break;
                    }
                }
            }
        }

        // set up instancing transforms using array of transforms 
        cylinder.setNumInstances(this.cylinderTransforms.length);

        let col0ArrayC = [];
        let col1ArrayC = [];
        let col2ArrayC = [];
        let col3ArrayC = [];
        let colorArrayC = [];
        for (let t = 0; t < this.cylinderTransforms.length; t++){
            col0ArrayC.push(this.cylinderTransforms[t][0], this.cylinderTransforms[t][1], this.cylinderTransforms[t][2], this.cylinderTransforms[t][3]);
            col1ArrayC.push(this.cylinderTransforms[t][4], this.cylinderTransforms[t][5], this.cylinderTransforms[t][6], this.cylinderTransforms[t][7]);
            col2ArrayC.push(this.cylinderTransforms[t][8], this.cylinderTransforms[t][9], this.cylinderTransforms[t][10], this.cylinderTransforms[t][11]);
            col3ArrayC.push(this.cylinderTransforms[t][12], this.cylinderTransforms[t][13], this.cylinderTransforms[t][14], this.cylinderTransforms[t][15]);
            colorArrayC.push(82/255.0, 76/255.0, 62/255.0, 1);
        }

        let transformsCol0C: Float32Array = new Float32Array(col0ArrayC);
        let transformsCol1C: Float32Array = new Float32Array(col1ArrayC);
        let transformsCol2C: Float32Array = new Float32Array(col2ArrayC);
        let transformsCol3C: Float32Array = new Float32Array(col3ArrayC);
        let colorsC: Float32Array = new Float32Array(colorArrayC);
        cylinder.setInstanceVBOs(transformsCol0C, transformsCol1C, transformsCol2C, transformsCol3C, colorsC);

        let col0ArrayL = [];
        let col1ArrayL = [];
        let col2ArrayL = [];
        let col3ArrayL = [];
        let colorArrayL = [];
        flower.setNumInstances(this.leafTransforms.length);
        for (let t = 0; t < this.leafTransforms.length; t++){
            col0ArrayL.push(this.leafTransforms[t][0], this.leafTransforms[t][1], this.leafTransforms[t][2], this.leafTransforms[t][3]);
            col1ArrayL.push(this.leafTransforms[t][4], this.leafTransforms[t][5], this.leafTransforms[t][6], this.leafTransforms[t][7]);
            col2ArrayL.push(this.leafTransforms[t][8], this.leafTransforms[t][9], this.leafTransforms[t][10], this.leafTransforms[t][11]);
            col3ArrayL.push(this.leafTransforms[t][12], this.leafTransforms[t][13], this.leafTransforms[t][14], this.leafTransforms[t][15]);
            colorArrayL.push(1, 1, 1, 1);
        }

        let transformsCol0L: Float32Array = new Float32Array(col0ArrayL);
        let transformsCol1L: Float32Array = new Float32Array(col1ArrayL);
        let transformsCol2L: Float32Array = new Float32Array(col2ArrayL);
        let transformsCol3L: Float32Array = new Float32Array(col3ArrayL);
        let colorsL = new Float32Array(colorArrayL);
        flower.setInstanceVBOs(transformsCol0L, transformsCol1L, transformsCol2L, transformsCol3L, colorsL);
    }

    // ------------------------ DRAW RULES --------------------------- //

    /// Copy the current turtle, then push it to the top of the stack
    pushTurtle() {
        this.turtleStack.push(this.turtle);
        //console.log("Pushing turtle " + this.turtle.id);
        this.turtle = this.turtle.duplicate(this.numTurtles);
        this.numTurtles++;  
    }

    /// Pop a turtle of the stack, set as current turtle
    popTurtle() {
        this.turtle = this.turtleStack.pop();
        //console.log("Popping turtle " + this.turtle.id);
    }

    scaleTurtleXZ(amt: number){
        this.turtle.scaleXZ(amt);
    }

    /// Move the turtle by the given amount
    moveTurtle(amt: number) {
        for (let i = 0; i < amt; ++i){
            let rand = (Math.random() - 0.5) * 10.0;
            this.turtle.rotateZ(rand);
            this.turtle.move();
            this.cylinderTransforms.push(this.turtle.transform());
            this.turtle.scaleXZ(0.99);
        }
        //console.log("Moving turtle " + this.turtle.id);
    }

    /// Rotate the turtle around the z-axis by the given angle in degrees
    /// this involves rotating by 5 degrees at a time and drawing a cylinder
    /// until it reaches the desired rotation
    rotateTurtleX(amt: number){
        // find the number of rotations it needs to do
        let rotations = Math.abs(Math.floor(amt / 5.0));
        let sign = amt >= 0 ? 1 : -1;
        let remainder = amt - (rotations * 5.0 * sign);

        // shrink the height of the cylinder so the turn isn't too long
        this.turtle.scaleMoveAmt(0.5);

        // for the calculated num rotations, rotate and draw a cylinder
        for (let i = 0; i < rotations; i++){
            this.turtle.rotateX(5 * sign);
            this.turtle.move(); 
            this.cylinderTransforms.push(this.turtle.transform());
        }

        // scale the cylinder height back up
        this.turtle.scaleMoveAmt(2.0);

        // rotate the remainder, if there is any
        this.turtle.rotateX(remainder);
        this.cylinderTransforms.push(this.turtle.transform());
        //console.log("Rotating turtle " + this.id);
    }

    /// Rotate the turtle around the z-axis by the given angle in degrees
    /// this involves rotating by 5 degrees at a time and drawing a cylinder
    /// until it reaches the desired rotation
    rotateTurtleZ(amt: number){
        // find the number of rotations it needs to do
        let rotations = Math.abs(Math.floor(amt / 5.0));
        let sign = amt >= 0 ? 1 : -1;
        let remainder = amt - (rotations * 5.0 * sign);

        // shrink the height of the cylinder so the turn isn't too long
        this.turtle.scaleMoveAmt(0.5);

        // for the calculated num rotations, rotate and draw a cylinder
        for (let i = 0; i < rotations; i++){
            this.turtle.rotateZ(5 * sign);
            this.turtle.move(); 
            this.cylinderTransforms.push(this.turtle.transform());
        }

        // scale the cylinder height back up
        this.turtle.scaleMoveAmt(2.0);

        // rotate the remainder, if there is any
        this.turtle.rotateZ(remainder);
        this.cylinderTransforms.push(this.turtle.transform());
        //console.log("Rotating turtle " + this.id);
    }

    /// Scale the turtle by the amounts specified [x, y, z] 
    scaleTurtleHeight(amt: number){
        this.turtle.scaleMoveAmt(amt);
    } 

    createLeaf(){
        this.turtle.scale = vec3.fromValues(0.2, 0.2, 0.2);
        this.turtle.move();
        this.leafTransforms.push(this.turtle.transform());
    }
}



