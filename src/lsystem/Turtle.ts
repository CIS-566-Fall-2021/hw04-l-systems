import {vec3, mat4} from 'gl-matrix';

class Turtle {
    position: vec3;
    orientation: vec3;
    rotTransform: mat4;
    depth: number;
    enabled: boolean;
    type: string;
    radius: number;

    static readonly DEFAULT_RADIUS = 0.5;
    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.orientation = vec3.fromValues(0, 1, 0);
        this.rotTransform = mat4.create();
        mat4.identity(this.rotTransform);

        this.depth = 1;
        this.enabled = true;
        this.type = "branch";
        this.radius = Turtle.DEFAULT_RADIUS;
    }
};

export default Turtle; 