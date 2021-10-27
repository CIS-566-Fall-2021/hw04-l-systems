import {vec3, vec2, mat3, mat4} from 'gl-matrix';
import * as DAT from 'dat-gui';
import {setGL} from 'globals';

class InstancedData {
    // https://stackoverflow.com/questions/24627445/how-to-include-model-matrix-to-a-vbo
    transformColumnX : Array<number>;
    transformColumnY : Array<number>;
    transformColumnZ : Array<number>;
    transformColumnW : Array<number>;
    uvCell : Array<number>;

    size : number;

    constructor() {
        this.size = 0
        this.transformColumnX = new Array<number>()
        this.transformColumnY = new Array<number>()
        this.transformColumnZ = new Array<number>()
        this.transformColumnW = new Array<number>()
        this.uvCell = new Array<number>()

    }

    addTransform(transform : mat4) {
        // Push back rows in column major order
        for (var i = 0; i < 4; i++) {
            this.transformColumnX.push(transform[i]);
            this.transformColumnY.push(transform[4 + i]);
            this.transformColumnZ.push(transform[8 + i]);
            this.transformColumnW.push(transform[12 + i]);

        }
        this.uvCell.push(0.0);
        this.size += 1;
    }

    addInstance(transform : mat4, uv_cell : number) {
        // Push back rows in column major order
        for (var i = 0; i < 4; i++) {
            this.transformColumnX.push(transform[i]);
            this.transformColumnY.push(transform[4 + i]);
            this.transformColumnZ.push(transform[8 + i]);
            this.transformColumnW.push(transform[12 + i]);

        }
        this.uvCell.push(uv_cell);
        this.size += 1;
    }

};
 
export default InstancedData;