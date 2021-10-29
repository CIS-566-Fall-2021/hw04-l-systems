//turtle class

import {vec4, vec3, mat4} from 'gl-matrix';

class Turtle {
  position: vec3 = vec3.create();
  forward: vec4 = vec4.create();
  up: vec4 = vec4.create();
  right: vec4 = vec4.create();
  depth: number;
  constructor() {
    this.position = vec3.fromValues(0, 0, 0);
    this.forward= vec4.fromValues(0, 0, 1, 0);
    this.up = vec4.fromValues(0, 1, 0, 0);
    this.right= vec4.fromValues(1, 0, 0, 0);
    this.depth = 1;
    //this.forward = vec3(1, 0, 1);

  }

  angleToRadians(angle: number) : number{
    angle = angle * (3.141592 / 180);
    return angle;
}
  rotateTurtle(type: number,  angle: number)
  {
    console.log("type");
    console.log(type)
      switch(type)
      {
        //rotate around right
      
        case(0):
        let mat = mat4.create()
        let newMat = mat4.fromRotation(mat, this.angleToRadians(angle), vec3.fromValues(this.right[0], this.right[1], this.right[2]));
        console.log(" Transform mat: " + newMat);
        let finalRight = vec4.fromValues(this.right[0], this.right[1], this.right[2], 0);
        let finalUp = vec4.fromValues(this.up[0], this.up[1], this.up[2], 0);
        let finalForward = vec4.fromValues(this.forward[0], this.forward[1], this.forward[2], 0);
        vec4.normalize(finalRight, vec4.transformMat4(finalRight, finalRight, newMat));
        vec4.normalize(finalUp, vec4.transformMat4(finalUp, finalUp, newMat));
        vec4.normalize(finalForward, vec4.transformMat4(finalForward, finalForward, newMat));
        this.right = finalRight;
        this.up = finalUp;
        this.forward = finalForward;
        break;
        case(1):
        console.log("case 1")
        let mat2 = mat4.create()
        let newMat2 = mat4.fromRotation(mat2, this.angleToRadians(angle), vec3.fromValues(this.forward[0], this.forward[1], this.forward[2]));
        console.log(" Transform mat: " + newMat2);
        let finalRight2 = vec4.fromValues(this.right[0], this.right[1], this.right[2], 0);
        let finalUp2 = vec4.fromValues(this.up[0], this.up[1], this.up[2], 0);
        let finalForward2 = vec4.fromValues(this.forward[0], this.forward[1], this.forward[2], 0);
        vec4.transformMat4(finalRight2, finalRight2, newMat2);
        vec4.transformMat4(finalUp2, finalUp2, newMat2);
        vec4.transformMat4(finalForward2, finalForward2, newMat2);
        this.right = finalRight2;
        this.up = finalUp2;
        this.forward = finalForward2;
    
        break;
        case(2):
        let mat3 = mat4.create()
        let newMat3= mat4.fromRotation(mat3, this.angleToRadians(angle), vec3.fromValues(this.up[0], this.up[1], this.up[2]));
        console.log(" Transform mat: " + newMat3);
        let finalRight3 = vec4.fromValues(this.right[0], this.right[1], this.right[2], 0);
        let finalUp3 = vec4.fromValues(this.up[0], this.up[1], this.up[2], 0);
        let finalForward3 = vec4.fromValues(this.forward[0], this.forward[1], this.forward[2], 0);
        vec4.transformMat4(finalRight3, finalRight3, newMat3);
        vec4.transformMat4(finalUp3, finalUp3, newMat3);
        vec4.transformMat4(finalForward3, finalForward3, newMat3);
        this.right = finalRight3;
        this.up = finalUp3;
        this.forward = finalForward3;
        break;
      }
         
  }

  getTransformation() : mat4
  {
      let translateMat: mat4 = mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, this.position[0], this.position[1], this.position[2], 1);
      let rotMat = mat4.fromValues(this.right[0], this.right[1], this.right[2], 0, this.up[0], this.up[1], this.up[2], 0, this.forward[0], this.forward[1], this.forward[2], 0,  0, 0, 0, 1);
      let transMat = mat4.create();
      mat4.multiply(transMat, translateMat, rotMat);
      //return translateMat;
      let scaleMat = mat4.fromValues(3 / this.depth, 0, 0, 0, 0, 1.5 / (this.depth * .5), 0, 0, 0, 0, 3 / this.depth, 0, 0, 0, 0, 1);
      mat4.multiply(transMat, transMat, scaleMat);
      return transMat;
  }

  getLeafTransformation(): mat4
  {

      let pos = vec3.create();
      let mat = mat4.create();
      let amount = Math.random() * (5 - -2) - 2;
      pos[0] = this.up[0] * amount;
      pos[1] = this.up[1] * amount;
      pos[2] = this.up[2] * amount;
      let u = Math.random() * (40 - 10) + 10;
      let r = Math.random() * (180- 0) + 0;
      let newPos = vec3.fromValues(pos[0], pos[1], pos[2]);
      let translateMat: mat4 = mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, this.position[0] + newPos[0], this.position[1] + newPos[1], this.position[2] + newPos[2], 1);
      let newMatUp= mat4.fromRotation(mat, this.angleToRadians(u), vec3.fromValues(this.up[0], this.up[1], this.up[2]));
      let newMatRight= mat4.fromRotation(mat, this.angleToRadians(r), vec3.fromValues(this.right[0], this.right[1], this.right[2]));
      //let newMatFoward= mat4.fromRotation(mat, this.angleToRadians(45), vec3.fromValues(this.forward[0], this.forward[1], this.forward[2]));
      mat4.multiply(newMatUp, newMatRight, newMatUp)
     // mat4.multiply(newMatUp, newMatFoward, newMatUp)
      //let rotMat = mat4.fromValues(this.right[0], this.right[1], this.right[2], 0, this.up[0], this.up[1], this.up[2], 0, this.forward[0], this.forward[1], this.forward[2], 0,  0, 0, 0, 1);
      let transMat = mat4.create();
      mat4.multiply(transMat, translateMat, newMatUp);
      //return translateMat;
      let scaleMat = mat4.fromValues(.5, 0, 0, 0, 0, .5, 0, 0, 0, 0, .5, 0, 0, 0, 0, 1);
      mat4.multiply(transMat, transMat, scaleMat);
      return transMat;
  }

  updatePos(pos: vec3) 
  {
    vec3.add(this.position, this.position, pos);
  }
  newTurtle(oldTurt: Turtle): Turtle {
      let newTurt  = new Turtle();
      vec3.copy(newTurt.position, oldTurt.position);
      vec4.copy(newTurt.forward, oldTurt.forward);
      vec4.copy(newTurt.up, oldTurt.up);
      vec4.copy(newTurt.right, oldTurt.right);
      newTurt.depth = oldTurt.depth;
      return newTurt;
  }

};
export default Turtle;