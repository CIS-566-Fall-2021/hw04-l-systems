import {vec3, mat4} from 'gl-matrix';

class Turtle {
    position: vec3;
    orientation: vec3;
    rotTransform: mat4;
    depth: number;
    enabled: boolean;
    type: string;

    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.orientation = vec3.fromValues(0, 1, 0);
        this.rotTransform = mat4.create();
        mat4.identity(this.rotTransform);

        this.depth = 1;
        this.enabled = true;
        this.type = "branch";
    }
};

export default Turtle; 