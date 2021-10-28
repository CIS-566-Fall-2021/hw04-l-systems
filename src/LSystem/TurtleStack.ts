import Turtle from "Turtle"
class TurtleStack {
    stack: Turtle[] = []; 

    constructor() {}

    push(t: Turtle) {
        //console.log("SAVED");
        //.log(t.forward);
        this.stack.push(t);
    }

    pop() {
        //console.log("POPPPPPPPPED")
        return this.stack.pop();
    }
}

export default TurtleStack