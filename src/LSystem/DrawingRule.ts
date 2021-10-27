import {vec3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import {mat4} from 'gl-matrix';
import TurtleStack from './TurtleStack';
import Turtle from './Turtle';

class DrawingRule {
    t: Turtle;
    stack: TurtleStack;


    constructor() {
        this.t = new Turtle(vec3.fromValues(0., 0., 0.), 0)
        this.stack = new TurtleStack;
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
            case ('+'):
                this.t.rotate(vec3.fromValues(1., 0., 0.), 15);
                break;
            case ('+-'):
                this.t.rotate(vec3.fromValues(1., 0., 0.), -15);
                break;
            case ('^'):
                this.t.rotate(vec3.fromValues(0., 1., 0.), 15);
                break;
            case ('v'):
                this.t.rotate(vec3.fromValues(0., 1., 0.), -15);
                break;
            case ('('):
                this.t.rotate(vec3.fromValues(0., 0., 1.), 15);
                break;
            case (')'):
                this.t.rotate(vec3.fromValues(0., 0., 1.), -15);
                break;
            case ('['):
                this.stack.push(this.t.copy());
                break;
            case (']'):
                this.t = this.stack.pop();
                break;
        }
        return null;
    }
}
export default DrawingRule