
import {vec3, vec4, mat4} from 'gl-matrix';
import ExpansionRule from "./ExpansionRule";
import DrawingRule from "./DrawingRule";
import Turtle from "./Turtle";

export default class LSystem
{
    grammarString: string[];
    turtleArr: Turtle[];
    axiomString: string;
    currTurtle: number;

    currPos: vec4;
    currDirection: vec4;
    currTransformMat: mat4;

    theta: number;

    // Set up instanced rendering data arrays here.
    offsetsArray: number[];
    colorsArray: number[];

    // The transformation matrix to pass to the instancing shader
    col0: number[];
    col1: number[];
    col2: number[];
    col3: number[];

    numCylinders: number;

    currRecursionLevel: number;

    
    drawRules: Map<string, any>;

    constructor()
    {
        this.drawRules = new Map();
        this.drawRules.set('F', this.moveForward.bind(this));
        this.drawRules.set('+', this.rotateLeftZ.bind(this));
        
        this.drawRules.set('-', this.rotateRightZ.bind(this));


        this.drawRules.set('[', this.storeTurtle.bind(this));

        this.drawRules.set(']', this.loadTurtle.bind(this));

        this.currRecursionLevel = 1;

        this.currPos = vec4.fromValues(0.0, 0.0, 0.0, 1.0);

        this.currDirection = vec4.fromValues(0.0, 1.0, 0.0, 0.0);
    
        this.currTransformMat = mat4.create();

        this.theta = 3.14159 / 8.0;

        let startingTurtle = new Turtle(vec3.fromValues(0.0, 0.0, 0.0), 
                                        vec3.fromValues(0.0, 1.0, 0.0), 
                                        1,
                                        mat4.create());

        this.turtleArr = [startingTurtle];
        this.grammarString = ["F", "F", "-", "[", "-", "F", "+", 
                                "F", "]", "+", "[", "+", "F", "-", 
                                "F", "]"];
        this.axiomString = "F";
        this.currTurtle = 0;

        this.offsetsArray = [];
        this.colorsArray = [];

        this.col0 = [];
        this.col1 = [];
        this.col2 = [];
        this.col3 = [];

        this.numCylinders = 1;
    }

    // Turn the grammar into position and orientation
    // data for drawing
    computeDrawingData()
    {       
        // Always draw 1 object
        this.offsetsArray.push(0.0);
        this.offsetsArray.push(0.0);
        this.offsetsArray.push(0.0);

        this.col0.push(1.0);
        this.col0.push(0.0);
        this.col0.push(0.0);
        this.col0.push(0.0);

        this.col1.push(0.0);
        this.col1.push(1.0);
        this.col1.push(0.0);
        this.col1.push(0.0);

        this.col2.push(0.0);
        this.col2.push(0.0);
        this.col2.push(1.0);
        this.col2.push(0.0);

        this.col3.push(0.0);
        this.col3.push(0.0);
        this.col3.push(0.0);
        this.col3.push(1.0);

        for(let c in this.grammarString)
        {
            let func = this.drawRules.get(this.grammarString[c]);
            if(func)
            {
               func();
            }

            this.col0.push(this.currTransformMat[0]);
            this.col0.push(this.currTransformMat[1]);
            this.col0.push(this.currTransformMat[2]);
            this.col0.push(this.currTransformMat[3]);

            this.col1.push(this.currTransformMat[4]);
            this.col1.push(this.currTransformMat[5]);
            this.col1.push(this.currTransformMat[6]);
            this.col1.push(this.currTransformMat[7]);

            this.col2.push(this.currTransformMat[8]);
            this.col2.push(this.currTransformMat[9]);
            this.col2.push(this.currTransformMat[10]);
            this.col2.push(this.currTransformMat[11]);

            this.col3.push(this.currTransformMat[12]);
            this.col3.push(this.currTransformMat[13]);
            this.col3.push(this.currTransformMat[14]);
            this.col3.push(this.currTransformMat[15]);

            this.offsetsArray.push(this.currPos[0]);
            this.offsetsArray.push(this.currPos[1]);
            this.offsetsArray.push(this.currPos[2]);
            this.numCylinders++;
        }
        
        
        for(let i = 0; i < this.numCylinders; i++)
        {
            this.colorsArray.push(1.0);
            this.colorsArray.push(0.0);
            this.colorsArray.push(0.0);
            this.colorsArray.push(1.0); // Alpha channel
        }
    }

    moveForward(): void
    {
        let straight: mat4 = mat4.create();
        let moveForwardRule = new DrawingRule(4.0, straight);
        this.currDirection = moveForwardRule.returnNewDirection(this.currDirection);
        vec4.scaleAndAdd(this.currPos, this.currPos, this.currDirection, moveForwardRule.forwardAmount);
        mat4.mul(this.currTransformMat, this.currTransformMat, moveForwardRule.orientationMat);
    }

    rotateLeftZ(): void
    {
        let zAxis: vec3 = vec3.fromValues(0.0, 0.0, 1.0);
        let rotAboutZ = mat4.create();
        mat4.fromRotation(rotAboutZ, this.theta, zAxis);
        let rotateAboutZ = new DrawingRule(4.0, rotAboutZ);
        this.currDirection = rotateAboutZ.returnNewDirection(this.currDirection);
        vec4.scaleAndAdd(this.currPos, this.currPos, this.currDirection, rotateAboutZ.forwardAmount);
        mat4.mul(this.currTransformMat, this.currTransformMat, rotateAboutZ.orientationMat);
    }

    rotateRightZ(): void
    {
        let zAxis: vec3 = vec3.fromValues(0.0, 0.0, 1.0);
        let rotAboutZ = mat4.create();
        mat4.fromRotation(rotAboutZ, -this.theta, zAxis);
        let rotateAboutZ = new DrawingRule(4.0, rotAboutZ);
        this.currDirection = rotateAboutZ.returnNewDirection(this.currDirection);
        vec4.scaleAndAdd(this.currPos, this.currPos, this.currDirection, rotateAboutZ.forwardAmount);
        mat4.mul(this.currTransformMat, this.currTransformMat, rotateAboutZ.orientationMat);
    }


    storeTurtle(): void
    {
        let newTurtle: Turtle = new Turtle(vec3.fromValues(this.currPos[0], this.currPos[1], this.currPos[2]), 
                                            vec3.fromValues(this.currDirection[0], this.currDirection[1], this.currDirection[2]), 
                                                this.currRecursionLevel, this.currTransformMat);
        this.turtleArr.push(newTurtle);
    }

    loadTurtle(posIn: vec3, directionIn: vec3, 
        transformMat: mat4, currRecursionDepth: number): void
    {
        let currTurtle: Turtle = this.turtleArr.pop();
        let currTurPos: vec3 = currTurtle.position;
        this.currPos = vec4.fromValues(currTurPos[0], currTurPos[1], currTurPos[2], 1.0);
        let currTurDir: vec3 = currTurtle.orientation;
        this.currDirection = vec4.fromValues(currTurDir[0], currTurDir[1], currTurDir[2], 1.0);
    
        this.currTransformMat = currTurtle.transform;
        this.currRecursionLevel = currTurtle.recursionDepth;
    }

}
