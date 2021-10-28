
import {vec3, vec4, mat4} from 'gl-matrix';
import ExpansionRule from "./ExpansionRule";
import DrawingRule from "./DrawingRule";
import Turtle from "./Turtle";

export default class LSystem
{
    grammarString: string[];
    turtleArr: Turtle[];
    currTurtle: number;

    currPos: vec4;
    currDirection: vec4;
    currTransformMat: mat4;
    currScale: number;

    numIterations: number;

    theta: number;

    forwardLength: number;

    theColor: vec4;

    barkColor: vec4;

    // Set up instanced rendering data arrays here.
    offsetsArray: number[];

    leafOffsetsArray: number[];

    colorsArray: number[];
    scaleArray: number[];

    // The transformation matrix to pass to the instancing shader
    col0: number[];
    col1: number[];
    col2: number[];
    col3: number[];

    numCylinders: number;

    numLeaves: number;

    currRecursionLevel: number;

    
    drawRules: Map<string, any>;

    expansionRules: Map<string, ExpansionRule>;


    constructor(angle: number, iterations: number, forwardLength: number, barkColor: vec4)
    {
        this.drawRules = new Map();
        this.drawRules.set('F', this.moveForward.bind(this));

        this.drawRules.set('+Z', this.rotateLeftZ.bind(this));
        this.drawRules.set('-Z', this.rotateRightZ.bind(this));

        this.drawRules.set('+X', this.rotateLeftX.bind(this));
        this.drawRules.set('-X', this.rotateRightX.bind(this));

        this.drawRules.set('+Y', this.rotateLeftY.bind(this));
        this.drawRules.set('-Y', this.rotateRightY.bind(this));


        this.drawRules.set('[', this.storeTurtle.bind(this));

        this.drawRules.set(']', this.loadTurtle.bind(this));

        this.expansionRules = new Map();

        let expandStringF_1: string[] = ["F", "A", "-Z", "+X",
        "[", "+X", "-Z", "F", "-X", "+Z", "F", "L", "]", 
        "+Z", "[", "-X", "+Z", "F", "+X", "-Z", "F", "L", "]"];

        let expandStringF_2: string[] = ["F", "A", "+Z",
        "[", "+X", "-Z", "F", "-X", "+Z", "F", "L", "]", "-Z"];

        let expandRuleF = new ExpansionRule("F");
        this.expansionRules.set("F", expandRuleF);
        expandRuleF.addExpansion(expandStringF_1, 0.4);
        expandRuleF.addExpansion(expandStringF_2, 0.6);

        let expandStringA_1: string[] = ["F", "+Z", "-X", "A", "[", "+Z", 
        "-X", "F", "L", "]", "-Z", "+X"]

        let expandStringA_2: string[] = ["F", "+X", "+Z", "A", "[", "+Z", 
        "-X", "F", "L", "]", "-Z", "-X"]

        let expandRuleA = new ExpansionRule("A");
        this.expansionRules.set("A", expandRuleA);
        expandRuleA.addExpansion(expandStringA_1, 0.6);
        expandRuleA.addExpansion(expandStringA_2, 0.4);


        this.currRecursionLevel = 1;

        this.currPos = vec4.fromValues(0.0, 0.0, 0.0, 1.0);

        this.currDirection = vec4.fromValues(0.0, 1.0, 0.0, 0.0);

        this.currScale = 1.0;
    
        this.currTransformMat = mat4.create();

        this.theta = angle;

        this.numIterations = iterations;

        this.forwardLength = forwardLength;

        this.theColor = barkColor;

        this.barkColor = barkColor;

        let startingTurtle = new Turtle(vec3.fromValues(0.0, 0.0, 0.0), 
                                        vec3.fromValues(0.0, 1.0, 0.0), 
                                        1,
                                        mat4.create());

        this.turtleArr = [startingTurtle];
        this.grammarString = ["F", "A", "["];

        this.currTurtle = 0;

        this.offsetsArray = [];

        this.leafOffsetsArray = [];

        this.colorsArray = [];
        this.scaleArray = [];

        this.col0 = [];
        this.col1 = [];
        this.col2 = [];
        this.col3 = [];

        this.numCylinders = 1;

        this.numLeaves = 0;
    }


    expand()
    {
        let outStringArr: string[] = [];
        let stringArr: string[] = [];
        for(let i = 0; i < this.numIterations; i++)
        {
            for(let c in this.grammarString)
            {
                let currRule = this.expansionRules.get(this.grammarString[c]);
                if(currRule)
                {
                    let randVal: number = Math.random();
                    stringArr = currRule.returnRandExpansion(randVal);

                    for(let s in stringArr)
                    {
                        outStringArr.push(stringArr[s]);
                    }
                }
                else
                outStringArr.push(this.grammarString[c]);
            }
        }

        this.grammarString = outStringArr;
    }


    // Turn the grammar into position and orientation
    // data for drawing
    computeDrawingData()
    {       
        // Always draw 1 object
        this.offsetsArray.push(0.0);
        this.offsetsArray.push(0.0);
        this.offsetsArray.push(0.0);

        this.scaleArray.push(1.0);

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
            let draw: boolean = true;
            let currString: string = this.grammarString[c];

            if(currString == "L")
            {
                // Green: Leaf Color
                this.theColor = vec4.fromValues(0.1647, 0.4863, 0.1373, 1.0);
            
                this.leafOffsetsArray.push(this.currPos[0] - this.currDirection[0] * 0.5);
                this.leafOffsetsArray.push(this.currPos[1] - this.currDirection[1] * 0.5);
                this.leafOffsetsArray.push(this.currPos[2] - this.currDirection[2] * 0.5);

                this.numLeaves++;
            }
            else
            {
                let func = this.drawRules.get(currString);
                if(func)
                {
                draw = func();
                }

                if(draw)
                {
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

                    this.offsetsArray.push(this.currPos[0] - this.currDirection[0] * 0.5);
                    this.offsetsArray.push(this.currPos[1] - this.currDirection[1] * 0.5);
                    this.offsetsArray.push(this.currPos[2] - this.currDirection[2] * 0.5);

                    this.scaleArray.push(this.currScale);

                    this.numCylinders++;
                }
            }

            this.colorsArray.push(this.theColor[0]);
            this.colorsArray.push(this.theColor[1]);
            this.colorsArray.push(this.theColor[2]);
            this.colorsArray.push(1.0); // Alpha channel
        }
    }

    moveForward(): boolean
    {
        let straight: mat4 = mat4.create();
        let moveForwardRule = new DrawingRule(this.forwardLength, straight);
        this.currDirection = moveForwardRule.returnNewDirection(this.currDirection);
        vec4.scaleAndAdd(this.currPos, this.currPos, this.currDirection, moveForwardRule.forwardAmount);

        mat4.mul(this.currTransformMat, this.currTransformMat, moveForwardRule.orientationMat);
        
        this.theColor = this.barkColor;

        return true;
    }

    rotateLeftZ(): boolean
    {
        let zAxis: vec3 = vec3.fromValues(0.0, 0.0, 1.0);
        let rotAboutZ = mat4.create();

        let rotAngle = this.theta + Math.random() / 10.0;

        mat4.fromRotation(rotAboutZ, rotAngle, zAxis);
        let rotateAboutZ = new DrawingRule(this.forwardLength, rotAboutZ);
        this.currDirection = rotateAboutZ.returnNewDirection(this.currDirection);
        vec4.scaleAndAdd(this.currPos, this.currPos, this.currDirection, rotateAboutZ.forwardAmount);
        mat4.mul(this.currTransformMat, this.currTransformMat, rotateAboutZ.orientationMat);
        
        this.theColor = this.barkColor;

        return true;
    }

    rotateRightZ(): boolean
    {
        let zAxis: vec3 = vec3.fromValues(0.0, 0.0, 1.0);
        let rotAboutZ = mat4.create();

        let rotAngle = this.theta + Math.random() / 10.0;

        mat4.fromRotation(rotAboutZ, -rotAngle, zAxis);
        let rotateAboutZ = new DrawingRule(this.forwardLength, rotAboutZ);
        this.currDirection = rotateAboutZ.returnNewDirection(this.currDirection);
        vec4.scaleAndAdd(this.currPos, this.currPos, this.currDirection, rotateAboutZ.forwardAmount);
        mat4.mul(this.currTransformMat, this.currTransformMat, rotateAboutZ.orientationMat);
        
        this.theColor = this.barkColor;

        return true;
    }


    rotateLeftX(): boolean
    {
        let xAxis: vec3 = vec3.fromValues(1.0, 0.0, 0.0);
        let rotAboutX = mat4.create();

        let rotAngle = this.theta + Math.random() / 10.0;

        mat4.fromRotation(rotAboutX, rotAngle, xAxis);
        let rotateAboutX = new DrawingRule(this.forwardLength, rotAboutX);
        this.currDirection = rotateAboutX.returnNewDirection(this.currDirection);
        vec4.scaleAndAdd(this.currPos, this.currPos, this.currDirection, rotateAboutX.forwardAmount);
        mat4.mul(this.currTransformMat, this.currTransformMat, rotateAboutX.orientationMat);

        this.theColor = this.barkColor;

        return true;
    }

    rotateRightX(): boolean
    {
        let xAxis: vec3 = vec3.fromValues(1.0, 0.0, 0.0);
        let rotAboutX = mat4.create();

        let rotAngle = this.theta + Math.random() / 10.0;

        mat4.fromRotation(rotAboutX, -rotAngle, xAxis);
        let rotateAboutX = new DrawingRule(this.forwardLength, rotAboutX);
        this.currDirection = rotateAboutX.returnNewDirection(this.currDirection);
        vec4.scaleAndAdd(this.currPos, this.currPos, this.currDirection, rotateAboutX.forwardAmount);
        mat4.mul(this.currTransformMat, this.currTransformMat, rotateAboutX.orientationMat);
        
        this.theColor = this.barkColor;

        return true;
    }


    rotateLeftY(): boolean
    {
        let yAxis: vec3 = vec3.fromValues(0.0, 1.0, 0.0);
        let rotAboutY = mat4.create();

        let rotAngle = this.theta + Math.random() / 10.0;

        mat4.fromRotation(rotAboutY, rotAngle, yAxis);
        let rotateAboutY = new DrawingRule(this.forwardLength, rotAboutY);
        this.currDirection = rotateAboutY.returnNewDirection(this.currDirection);
        vec4.scaleAndAdd(this.currPos, this.currPos, this.currDirection, rotateAboutY.forwardAmount);
        mat4.mul(this.currTransformMat, this.currTransformMat, rotateAboutY.orientationMat);
        
        this.theColor = this.barkColor;
        return true;
    }

    rotateRightY(): boolean
    {
        let yAxis: vec3 = vec3.fromValues(0.0, 1.0, 0.0);
        let rotAboutY = mat4.create();
        mat4.fromRotation(rotAboutY, -this.theta, yAxis);
        let rotateAboutY = new DrawingRule(this.forwardLength, rotAboutY);
        this.currDirection = rotateAboutY.returnNewDirection(this.currDirection);
        vec4.scaleAndAdd(this.currPos, this.currPos, this.currDirection, rotateAboutY.forwardAmount);
        mat4.mul(this.currTransformMat, this.currTransformMat, rotateAboutY.orientationMat);
        
        this.theColor = this.barkColor;

        return true;
    }


    storeTurtle(): boolean
    {   
        let currTransformMat: mat4 = mat4.create();
        mat4.copy(currTransformMat, this.currTransformMat);

        let newTurtle: Turtle = new Turtle(vec3.fromValues(this.currPos[0], this.currPos[1], this.currPos[2]), 
                                            vec3.fromValues(this.currDirection[0], this.currDirection[1], this.currDirection[2]), 
                                                this.currRecursionLevel, currTransformMat);
        this.turtleArr.push(newTurtle);

        this.currRecursionLevel++;

        this.currScale = 1.0 / (this.currRecursionLevel);

        return false;
    }

    loadTurtle(posIn: vec3, directionIn: vec3, 
        transformMat: mat4, currRecursionDepth: number): boolean
    {
        let currTurtle: Turtle = this.turtleArr.pop();
        let currTurPos: vec3 = currTurtle.position;
        this.currPos = vec4.fromValues(currTurPos[0], currTurPos[1], currTurPos[2], 1.0);
        let currTurDir: vec3 = currTurtle.orientation;
        this.currDirection = vec4.fromValues(currTurDir[0], currTurDir[1], currTurDir[2], 1.0);
    
        this.currTransformMat = currTurtle.transform;
        this.currRecursionLevel = currTurtle.recursionDepth;

        return false;
    }

}

