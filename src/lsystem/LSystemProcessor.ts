import { mat4, vec3 } from 'gl-matrix';
import Turtle from './turtle'

var PI = 3.14159;
class LSystemProcessor {
    state: string;
    turtleCurrent: Turtle;
    turtles: Array<Turtle>;
    rules: Map<String, String>;
    operations: Map<String, Function>;
    moveScale:number = 3;
    rotateRads:number = 0.34;
    randomMod:number = 1;
    drawFunc: Function;
    constructor(drawFunc: Function, axiom: string) {
        this.state = axiom;
        this.turtleCurrent = new Turtle();
        this.turtles = new Array<Turtle>();
        this.rules = new Map<String, String>();
        this.operations = new Map<String, Function>();
        this.drawFunc = drawFunc;

        this.operations.set('1', this.setBranch);
        this.operations.set('2', this.setLeaf);
        this.operations.set('F', this.moveAndDraw);
        this.operations.set('G', this.moveAndDraw);
        this.operations.set('H', this.moveAndDraw);
        this.operations.set('P', this.move);
        this.operations.set('R', this.rotate);
        this.operations.set('+', this.rotateZPositive);
        this.operations.set('-', this.rotateZNegative);
        this.operations.set('&', this.rotateYPositive);
        this.operations.set('[', this.pushTurtleState);
        this.operations.set(']', this.popTurtleState);

        let r = Turtle.DEFAULT_RADIUS;
        this.operations.set('a', function() { this.moveAndDraw(r * 2, "branch"); }.bind(this));
        this.operations.set('b', function() { this.moveAndDraw(r * 4, "branch"); }.bind(this));
        this.operations.set('c', function() { this.moveAndDraw(r * 7, "branch"); }.bind(this));
        this.operations.set('d', function() { this.moveAndDraw(r * 13, "branch"); }.bind(this));
        this.operations.set('e', function() { this.moveAndDraw(r * 25, "branch"); }.bind(this));
    }

    moveAndDraw(
        radius: number = Turtle.DEFAULT_RADIUS,
        type: string = null) {
        if (!this.turtleCurrent.enabled) {
            return;
        }

        let assetTrans = mat4.create();
        let translation = mat4.create();
        let scale = mat4.create();
        mat4.identity(assetTrans);
        mat4.fromTranslation(translation, this.turtleCurrent.position);
        let wScale = 1;//(1 / Math.pow(this.turtleCurrent.depth, 1.5)) * 2;
        mat4.fromScaling(scale, [radius * wScale, this.moveScale, radius * wScale]);

        mat4.multiply(assetTrans, scale, assetTrans);
        mat4.multiply(assetTrans, this.turtleCurrent.rotTransform, assetTrans);
        mat4.multiply(assetTrans, translation, assetTrans);
        this.drawFunc(
            assetTrans,
            type == null ? this.turtleCurrent.type : type);

        this.move();
    }
    
    getRotateRads() {
        return this.rotateRads;// + ((Math.random() - 0.5) / 8) * this.turtleCurrent.depth;
    }

    rotateXPositive() {
        let rot: mat4 = mat4.create();
        mat4.fromXRotation(rot, this.getRotateRads());

        mat4.multiply(
            this.turtleCurrent.rotTransform,
            rot,
            this.turtleCurrent.rotTransform);
        
        vec3.transformMat4(
            this.turtleCurrent.orientation,
            this.turtleCurrent.orientation,
            rot);
    }

    rotateXNegative() {
        let rot: mat4 = mat4.create();
        mat4.fromXRotation(rot, -this.getRotateRads());

        mat4.multiply(
            this.turtleCurrent.rotTransform,
            rot,
            this.turtleCurrent.rotTransform);
        
        vec3.transformMat4(
            this.turtleCurrent.orientation,
            this.turtleCurrent.orientation,
            rot);
    }

    rotateYPositive() {
        let rot: mat4 = mat4.create();
        mat4.fromYRotation(rot, this.getRotateRads());

        mat4.multiply(
            this.turtleCurrent.rotTransform,
            rot,
            this.turtleCurrent.rotTransform);
        
        vec3.transformMat4(
            this.turtleCurrent.orientation,
            this.turtleCurrent.orientation,
            rot);
    }

    rotateYNegative() {
        let rot: mat4 = mat4.create();
        mat4.fromYRotation(rot, -this.getRotateRads());

        mat4.multiply(
            this.turtleCurrent.rotTransform,
            rot,
            this.turtleCurrent.rotTransform);
        
        vec3.transformMat4(
            this.turtleCurrent.orientation,
            this.turtleCurrent.orientation,
            rot);
    }

    rotateZPositive() {
        
        // vec3.rotateZ(
        //     this.turtleCurrent.orientation,
        //     this.turtleCurrent.orientation,
        //     vec3.fromValues(0,0,0),
        //     this.rotateRads);
        
        let rot: mat4 = mat4.create();
        mat4.fromZRotation(rot, this.getRotateRads());

        mat4.multiply(
            this.turtleCurrent.rotTransform,
            rot,
            this.turtleCurrent.rotTransform);
        
        vec3.transformMat4(
            this.turtleCurrent.orientation,
            this.turtleCurrent.orientation,
            rot);
    }

    rotateZNegative() {
        let rot: mat4 = mat4.create();
        mat4.fromZRotation(rot, -this.getRotateRads());

        mat4.multiply(
            this.turtleCurrent.rotTransform,
            rot,
            this.turtleCurrent.rotTransform);
        
        vec3.transformMat4(
            this.turtleCurrent.orientation,
            this.turtleCurrent.orientation,
            rot);
    }
    
    move() {
        let newPos:vec3 = vec3.create();
        let moveVec: vec3 = vec3.create();
        vec3.multiply(moveVec,
            this.turtleCurrent.orientation,
            [this.moveScale, this.moveScale, this.moveScale]);

        vec3.add(newPos,
            this.turtleCurrent.position,
            moveVec);

        this.turtleCurrent.position = vec3.clone(newPos);
    }

    rotate() {
        //this.turtleCurrent.angle += (NoiseFunctions::random() - 0.5) / 2;
    }

    pushTurtleState() {
        let old = this.turtleCurrent;
        this.turtles.push(old);
        this.turtleCurrent = new Turtle();
        this.turtleCurrent.position = vec3.clone(old.position);
        this.turtleCurrent.depth = old.depth;
        
        this.turtleCurrent.enabled = old.enabled ?
            (Math.random() > -1) : false;

        this.turtleCurrent.orientation = vec3.clone(old.orientation);
        this.turtleCurrent.rotTransform = mat4.clone(old.rotTransform);
        this.turtleCurrent.type = old.type;

        // let x: number = this.turtleCurrent.depth;
        // let chanceDisable:number = x*x / (1 + x*x);
        // if (NoiseFunctions::random() < chanceDisable) {
        //     this.turtleCurrent.disabled = true;
        // }
        this.turtleCurrent.depth++;
    }

    setBranch() {
        this.turtleCurrent.type = "branch";
    }

    setLeaf() {
        this.turtleCurrent.type = "leaf";
    }

    popTurtleState() {
        this.turtleCurrent = this.turtles.pop();
    }

    draw() {
        for (let i = 0; i < this.state.length; i++) {
            const c = this.state.charAt(i);
            if (!this.operations.has(c)) {
                continue;
            }

            let op = this.operations.get(c).bind(this);
            op();
        }

        return this.turtleCurrent;
    }

    registerRule(from:string, to:string) {
        this.rules.set(from, to);
    }

    step() {
        let stream: string = "";
        for (let i = 0; i < this.state.length; i++) {
            const c = this.state.charAt(i);
            if (!this.rules.has(c)) {
                stream += c;
                continue;
            }

            stream += this.rules.get(c);
        }

        return (this.state = stream);
    }

    stepMulti(count: number) {
        for (let i = 0; i < count; i++) {
            this.step();
        }

        return this.state;
    }
};

export default LSystemProcessor;