import Turtle from "Turtle"
class TurtleStack {
    stack: Turtle[] = []; 

    constructor() {}

    push(t: Turtle) {
        this.stack.push(t);
    }

    pop() {
        return this.stack.pop();
    }
}

export default TurtleStack