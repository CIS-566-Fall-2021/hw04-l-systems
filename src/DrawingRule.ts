
import {vec3, vec4, mat3, mat4} from 'gl-matrix';

export default class DrawingRule
{
    forwardAmount: number;
    orientationMat: mat4

    constructor(forwardAmountIn: number, 
                orientationMatIn: mat4)
    {
        this.forwardAmount = forwardAmountIn;
        this.orientationMat = orientationMatIn;
    }


    returnNewDirection(startingDirection: vec4): vec4
    {
        let newDirection: vec4 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
    
        vec4.transformMat4(newDirection, startingDirection, this.orientationMat);

        return newDirection;
    }

}



