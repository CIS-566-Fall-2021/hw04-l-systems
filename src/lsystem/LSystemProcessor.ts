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
    drawFunc: Function;
    chanceDisable: number;
    moveJitter: number;
    rotateVariance: number;
    constructor(
        drawFunc: Function,
        axiom: string,
        angle: number,
        chanceDisable: number,
        moveJitter: number,
        rotateVariance: number) {
        this.rotateRads = angle;
        this.chanceDisable = chanceDisable;
        this.moveJitter = moveJitter;
        this.rotateVariance = rotateVariance;
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
        this.operations.set('D', this.chanceTurtleDisable);
        this.operations.set('J', function() {
            let val = Math.random();
            this.move(val * this.moveJitter);
        })

        let r = Turtle.DEFAULT_RADIUS;
        this.operations.set('a', function(m:number) { this.moveAndDraw(m, r * 3, "branch"); }.bind(this));
        this.operations.set('b', function(m:number) { this.moveAndDraw(m, r * 6, "branch"); }.bind(this));
        this.operations.set('c', function(m:number) { this.moveAndDraw(m, r * 14, "branch"); }.bind(this));
        this.operations.set('d', function(m:number) { this.moveAndDraw(m, r * 20, "branch"); }.bind(this));
        this.operations.set('e', function(m:number) { this.moveAndDraw(m, r * 40, "branch"); }.bind(this));
    }

    chanceTurtleDisable() {
        if (Math.random() < this.chanceDisable) {
            this.turtleCurrent.enabled = false;
        }
    }

    moveAndDraw(
        multiplier: number = 1,
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
        mat4.fromScaling(scale, [radius * wScale, this.moveScale * multiplier, radius * wScale]);

        mat4.multiply(assetTrans, scale, assetTrans);
        mat4.multiply(assetTrans, this.turtleCurrent.rotTransform, assetTrans);
        mat4.multiply(assetTrans, translation, assetTrans);
        this.drawFunc(
            assetTrans,
            type == null ? this.turtleCurrent.type : type);

        this.move(multiplier);
    }
    
    getRotateRads() {
        return this.rotateRads + (this.rotateVariance * Math.random()) -
        (this.rotateVariance / 2);
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
    
    move(multiplier:number = 1) {
        let newPos:vec3 = vec3.create();
        let moveVec: vec3 = vec3.create();
        vec3.multiply(moveVec,
            this.turtleCurrent.orientation,
            [
                this.moveScale * multiplier,
                this.moveScale * multiplier,
                this.moveScale * multiplier
            ]);

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
        
        this.turtleCurrent.enabled = old.enabled;

        this.turtleCurrent.orientation = vec3.clone(old.orientation);
        this.turtleCurrent.rotTransform = mat4.clone(old.rotTransform);
        this.turtleCurrent.type = old.type;
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
        let sameCount = 0;
        for (let i = 0; i < this.state.length; i++) {
            const c = this.state.charAt(i);
            if (!this.operations.has(c)) {
                continue;
            }

            if (this.state.charAt(i + 1) === c &&
                (c === 'F' || c === 'a' || c === 'b'|| c === 'c'|| c === 'd'|| c === 'e'))  {
                sameCount++;
                continue;
            } else {
                let op = this.operations.get(c).bind(this);
                if (sameCount > 0) {
                    op(sameCount + 1);
                    sameCount = 0;
                    continue;
                }
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