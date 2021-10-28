import {vec3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import {mat4} from 'gl-matrix';
import TurtleStack from './TurtleStack';
import Turtle from './Turtle';

class DrawingRule {
    t: Turtle;
    stack: TurtleStack;
    angle: number;
    randomness: number;

    constructor(angle: number, randomness: number) {
        this.t = new Turtle(vec3.fromValues(0., 0., 0.), 0)
        this.stack = new TurtleStack;
        this.angle = angle;
        this.randomness = randomness;
    }

    noise(x: number) {
        return Math.abs((Math.sin (2 * x) + Math.sin(Math.PI * x) + 1.) / 2.);
    }

    rotateWithRandom(axis: vec3, angle: number) {
        let input: number = this.noise(this.t.position[0] * 100 + this.t.position[1] * 10 + this.t.position[2]);
        if (input < this.randomness) {
            if (input < this.randomness / 2) {
                //opposite rotation
                this.t.rotate(axis, -this.angle);
            } 
        } else {
            //standard rotation
            this.t.rotate(axis, this.angle);
        }
    }

    caseOnChar(c: string) {
        if (c.length != 1) {    
            return null;
        }
        switch (c) {
            case ('A'): 
                return this.t.nextTurtle();
            case ('B'):
                return this.t.nextTurtle();
            case ('C'):
                return this.t.nextTurtle();
            case ('D'):
                //Special case
                return this.t.nextTurtle();
            case ('E'):
                return this.t.nextTurtle();
            case ('F'):
                return this.t.nextTurtle();
            case ('G'):
                return this.t.nextTurtle();
            case ('+'):
                this.rotateWithRandom(vec3.fromValues(1., 0., 0.), this.angle);
                break;
            case ('-'):
                this.rotateWithRandom(vec3.fromValues(-1., 0., 0.), this.angle);
                break;
            case ('&'):
                this.rotateWithRandom(vec3.fromValues(0., 1., 0.), this.angle);
                break;
            case ('^'):
                this.rotateWithRandom(vec3.fromValues(0., -1., 0.), this.angle);
                break;
            case ('('):
                this.rotateWithRandom(vec3.fromValues(0., 0., 1.), this.angle);
                break;
            case (')'):
                this.rotateWithRandom(vec3.fromValues(0., 0., -1.), this.angle);
                break;
            case ('['):
                this.stack.push(this.t.copy());
                break;
            case (']'):
                this.t = this.stack.pop();
                //console.log(this.t.forward);
                break;
        }
        return null;
    }
}
export default DrawingRule