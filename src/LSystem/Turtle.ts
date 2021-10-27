import {quat, vec3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import {mat4} from 'gl-matrix';

class Turtle {
    position: vec3;
    //Direction vector is as follows: x rotation, y rotation z rotation
    //default 0,0,0
    forward: vec3;
    // up: vec3;
    // right: vec3;
    iterations: number;
    rotation: quat;

    constructor(position: vec3, iterations: number) {
        console.log("made a turtle bitches");
        this.position = position;
        this.iterations = iterations;
        let initialRotation: quat = quat.create();
		let initialRotationDegrees: number = Math.PI * 0 / 180.0;
		let initialRotationAxis: vec3 = vec3.fromValues(0, 1, 0);
		quat.setAxisAngle(initialRotation, initialRotationAxis, initialRotationDegrees);
    	quat.normalize(initialRotation, initialRotation);
        this.rotation = initialRotation;
        this.forward = vec3.fromValues(0., 1., 0.);
    }

    copy() {
        let t: Turtle = new Turtle(vec3.clone(this.position), this.iterations)
        t.rotation = quat.clone(this.rotation);
        return t;
    }

    nextTurtle() {
        vec3.add(this.position, this.position, this.forward);
        return this;
    }

    //https://github.com/helenl9098/hw04-l-systems/blob/master/src/lsystem/turtle.ts
    rotate(axis: vec3, angle: number) {
		vec3.normalize(axis, axis);

		let q: quat = quat.create();
		let a: number = Math.PI * angle / 180.0;
		quat.setAxisAngle(q, axis, a);
    	quat.normalize(q, q);

    	let tempForward: vec4 = vec4.fromValues(this.forward[0], this.forward[1], this.forward[2], 0);
    	vec4.transformQuat(tempForward, tempForward, q);
    	this.forward = vec3.fromValues(tempForward[0], tempForward[1], tempForward[2]);
    	quat.rotationTo(this.rotation, vec3.fromValues(0., 1., 0.), this.forward);
    	quat.normalize(this.rotation, this.rotation);
	}
    
    getOffset() {
        return vec3.clone(this.position);
    }

    getQuat() {
        return vec4.fromValues(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]); 
    }
}

export default Turtle