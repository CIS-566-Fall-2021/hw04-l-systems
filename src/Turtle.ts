import {vec3, mat4} from 'gl-matrix';

export default class Turtle {
  position: vec3 = vec3.create();
  orientation: vec3 = vec3.create();
  recursionDepth: number = 0;
  thickness: number = 0;
  length: number = 0;
  branchColor: vec3 = vec3.create();
  leafColor: vec3 = vec3.create();
  fruitColor: vec3 = vec3.create();
  transform: mat4 = mat4.create();
  maxRecursionDepth: number = 0;

  constructor(pos: vec3, orient: vec3, recDepth: number, thick: number, len: number, branchCol: vec3, leafCol: vec3, fruitCol: vec3, numExp: number) {
    this.position = pos;
    this.orientation = orient;
    this.recursionDepth = recDepth;
    this.thickness = thick;
    this.length = len;
    this.branchColor = branchCol;
    this.leafColor = leafCol;
    this.fruitColor = fruitCol;
    this.maxRecursionDepth = numExp;
  }

  random3(p: vec3): number {
    let value: number = (Math.sin(vec3.dot(p,vec3.fromValues(127.1, 321.7, 653.2))) * 438.5453);
    value = value - Math.floor(value);
    return value;
}

  rotateZ(rad: number) {
    vec3.rotateZ(this.orientation, this.orientation, vec3.fromValues(0, 0, 0), rad);
    vec3.normalize(this.orientation, this.orientation);
    let newRot: mat4 = mat4.create();
    mat4.rotateZ(newRot, newRot, rad);
    mat4.multiply(this.transform, newRot, this.transform);
  }
  rotateY(rad: number) {
    vec3.rotateY(this.orientation, this.orientation, vec3.fromValues(0, 0, 0), rad);
    vec3.normalize(this.orientation, this.orientation);
    let newRot: mat4 = mat4.create();
    mat4.rotateY(newRot, newRot, rad);
    mat4.multiply(this.transform, newRot, this.transform);
  }
  rotateX(rad: number) {
    vec3.rotateX(this.orientation, this.orientation, vec3.fromValues(0, 0, 0), rad);
    vec3.normalize(this.orientation, this.orientation);
    let newRot: mat4 = mat4.create();
    mat4.rotateX(newRot, newRot, rad);
    mat4.multiply(this.transform, newRot, this.transform);
  }

  moveForward(): [Array<number>, Array<number>, Array<number>, Array<number>, Array<number>, number,
                  Array<number>, Array<number>, Array<number>, Array<number>, Array<number>, number,
                  Array<number>, Array<number>, Array<number>, Array<number>, Array<number>, number] { 
    let transformCols0Array: Array<number> = [];
    let transformCols1Array: Array<number> = [];
    let transformCols2Array: Array<number> = [];
    let transformCols3Array: Array<number> = [];
    let colorsArray: Array<number> = [];
    let numInstancesCylinder: number = 0;

    let transformCols0ArrayFruit: Array<number> = [];
    let transformCols1ArrayFruit: Array<number> = [];
    let transformCols2ArrayFruit: Array<number> = [];
    let transformCols3ArrayFruit: Array<number> = [];
    let colorsArrayFruit: Array<number> = [];
    let numInstancesFruit: number = 0;

    let transformCols0ArrayLeaf: Array<number> = [];
    let transformCols1ArrayLeaf: Array<number> = [];
    let transformCols2ArrayLeaf: Array<number> = [];
    let transformCols3ArrayLeaf: Array<number> = [];
    let colorsArrayLeaf: Array<number> = [];
    let numInstancesLeaf: number = 0;

    let scaledOrient: vec3 = vec3.create();
    vec3.scale(scaledOrient, this.orientation, this.length / 10);
    for (let i = 0; i < this.length; i++) {
      if (this.thickness < 0) {
        break;
      }
      let transformMat: mat4 = mat4.create();
      mat4.translate(transformMat, transformMat, this.position);
      mat4.multiply(transformMat, transformMat, this.transform);
      mat4.scale(transformMat, transformMat, vec3.fromValues(this.thickness, this.thickness * 1.5, this.thickness));
      for (let j = 0; j < 4; j++) {
        transformCols0Array.push(transformMat[0 + j]);
        transformCols1Array.push(transformMat[4 + j]);
        transformCols2Array.push(transformMat[8 + j]);
        transformCols3Array.push(transformMat[12 + j]);
        if (j == 3) colorsArray.push(1);
        else colorsArray.push(this.branchColor[j]);
      }
      numInstancesCylinder++;
      
      vec3.add(this.position, this.position, scaledOrient);
      switch (i / 3)
      {
        case 0:
          this.rotateX(this.random3(this.position) / this.length * 5);
          break;
        case 1:
          this.rotateY(this.random3(this.position) / this.length * 5);
          break;
        case 2:
          this.rotateZ(this.random3(this.position) / this.length * 5);
          break;
      }
      vec3.scale(scaledOrient, this.orientation, this.length / 10);
       
      this.thickness -= this.thickness / 20;
    }
    
    this.length *= .75;
    if (this.recursionDepth >= 2) {
      //print leaves, fruits
      let addFruit: Boolean = this.recursionDepth == this.maxRecursionDepth;
      
      let transformMatFruit: mat4 = mat4.create();
      let transformMatLeaf: mat4 = mat4.create();
      let moveBack: vec3 = vec3.create();
      let moveBackAmt: vec3 = vec3.create();
      vec3.scale(moveBackAmt, this.orientation, this.thickness * 1.5);
      vec3.subtract(moveBack, this.position, this.orientation);

      mat4.translate(transformMatFruit, transformMatFruit, this.position);
      mat4.multiply(transformMatFruit, transformMatFruit, this.transform);
      mat4.scale(transformMatFruit, transformMatFruit, vec3.fromValues(3, 3, 3));

      mat4.translate(transformMatLeaf, transformMatLeaf, moveBack);
      mat4.multiply(transformMatLeaf, transformMatLeaf, this.transform);
      mat4.scale(transformMatLeaf, transformMatLeaf, vec3.fromValues(4, 4, 4));

      for (let j = 0; j < 4; j++) {
        if (addFruit) {
          transformCols0ArrayFruit.push(transformMatFruit[0 + j]);
          transformCols1ArrayFruit.push(transformMatFruit[4 + j]);
          transformCols2ArrayFruit.push(transformMatFruit[8 + j]);
          transformCols3ArrayFruit.push(transformMatFruit[12 + j]);
          if (j == 3) colorsArrayFruit.push(1);
          else colorsArrayFruit.push(this.fruitColor[j]);
        }
        transformCols0ArrayLeaf.push(transformMatLeaf[0 + j]);
        transformCols1ArrayLeaf.push(transformMatLeaf[4 + j]);
        transformCols2ArrayLeaf.push(transformMatLeaf[8 + j]);
        transformCols3ArrayLeaf.push(transformMatLeaf[12 + j]);
        if (j == 3) colorsArrayLeaf.push(1);
        else colorsArrayLeaf.push(this.leafColor[j]);
      }
      if (addFruit) {
        numInstancesFruit++;
      }
      numInstancesLeaf++;
    }
    
    return [transformCols0Array, transformCols1Array, transformCols2Array, transformCols3Array, colorsArray, numInstancesCylinder,
            transformCols0ArrayFruit, transformCols1ArrayFruit, transformCols2ArrayFruit, transformCols3ArrayFruit, colorsArrayFruit, numInstancesFruit,
            transformCols0ArrayLeaf, transformCols1ArrayLeaf, transformCols2ArrayLeaf, transformCols3ArrayLeaf, colorsArrayLeaf, numInstancesLeaf];
  }

  clone(): Turtle {
    let newTurtle: Turtle = new Turtle(vec3.clone(this.position), vec3.clone(this.orientation), this.recursionDepth, this.thickness, this.length, this.branchColor,  this.leafColor, this.fruitColor, this.maxRecursionDepth);
    newTurtle.transform = mat4.clone(this.transform);
    return newTurtle;
  }
}