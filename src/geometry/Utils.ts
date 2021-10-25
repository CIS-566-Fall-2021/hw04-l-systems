import {vec3, vec4, mat4} from 'gl-matrix';

class Utils {
    static eulerTransformMatrix(center: vec3, euler: vec3, scale: vec3) : mat4 {
        let transform = mat4.create();
        mat4.translate(transform, transform, vec3.fromValues(center[0], center[1], center[2]));
        mat4.rotateX(transform, transform, euler[0] * Math.PI / 180);
        mat4.rotateY(transform, transform, euler[1] * Math.PI / 180);
        mat4.rotateZ(transform, transform, euler[2] * Math.PI / 180);
        mat4.scale(transform, transform, scale);    
        return transform;
    }

    static lookAtTransformMatrix(eye : vec3, target : vec3, up : vec3, scale : vec3) : mat4 {
        let translate = mat4.create();
        mat4.translate(translate, translate, vec3.fromValues(eye[0], eye[1], eye[2]));

        let rot = mat4.create();
        mat4.lookAt(rot, eye, target, up);

        let s = mat4.create();
        mat4.scale(s, s, scale);    

        let transform = mat4.create()
        mat4.multiply(transform, s, transform)
        mat4.multiply(transform, rot, transform)
        mat4.multiply(transform, translate, transform)


        return transform;

    }

    static rightUpForwardTransformMatrix(center : vec3, right : vec3, up : vec3, forward : vec3, scale : vec3) : mat4 {
        let translate = mat4.create();
        mat4.translate(translate, translate, vec3.fromValues(center[0], center[1], center[2]));

        let rot = mat4.fromValues(
            right[0], right[1], right[2], 0, 
            up[0], up[1], up[2], 0, 
            forward[0], forward[1], forward[2], 0, 
            0, 0, 0, 1
            );
        
       // mat4.transpose(rot, rot);
        let s = mat4.create();
        mat4.scale(s, s, scale);    

        let transform = mat4.create()
        mat4.multiply(transform, s, transform)
        mat4.multiply(transform, rot, transform)
        mat4.multiply(transform, translate, transform)

        return transform;

    }
};

export default Utils;
