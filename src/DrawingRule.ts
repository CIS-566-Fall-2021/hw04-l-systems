import Turtle from "./Turtle";

export default class DrawingRule{
    turtle: Turtle;
    char: string;
    a: number = 20;
    isOperation: boolean;
    isTurn: boolean;

    constructor(st: Turtle, c: string) {
        this.isTurn = false;
        this.turtle = st;
        this.char = c;
        this.getTurtle();
        
    }

    getTurtle() {
        if(this.char == 'F' || this.char == 'W' || this.char == 'D') {
            this.turtle.moveForward();
            this.isOperation = true;
        }
        if(this.char == '*') {
            this.turtle.FBackward(this.a);
            this.isOperation = true;
            this.isTurn = true;
        }
        if(this.char == '+') {
            this.turtle.FForward(this.a);
            this.isOperation = true;
            this.isTurn = true;
        }
        if(this.char == '&') {
            this.turtle.UForward(this.a);
            this.isOperation = true;
            this.isTurn = true;
        }
        if(this.char == '^') {
            this.turtle.UBackward(this.a);
            this.isOperation = true;
            this.isTurn = true;
        }
        if(this.char == '/') {
            this.turtle.RBackward(this.a);
            this.isOperation = true;
            this.isTurn = true;
        }
        if(this.char == '<') {
            this.turtle.RForward(this.a);
            this.isOperation = true;
            this.isTurn = true;
        }
    }
}