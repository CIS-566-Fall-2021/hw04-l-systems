import {vec3, mat4, vec4, mat3} from 'gl-matrix';
//import { transformMat4 } from 'gl-matrix/src/gl-matrix/vec2';
//import * as mat4 from 'gl-matrix/src/gl-matrix/mat4';
//import { add, multiply } from 'gl-matrix/src/gl-matrix/vec3';
import Turtle from './turtle';
import expansionRule from './expansionRule';
//import { random } from 'gl-matrix/src/gl-matrix/vec2';

class drawingRule{
   col1: number[] = [];
   col2: number[] = [];
   col3: number[] = [];
   col4: number[] = [];

   leaf1: number[] = [];
   leaf2: number[] = [];
   leaf3: number[] = [];
   leaf4: number[] = [];

    //final: string = 'F[-F]*F';
    final: string;
    iterations: number;
    axiom: string;
    scaleX: number = 1;
    scaleY: number = 1;
    scaleZ: number = 1;
    amount: number;
    angle: number;
    leafAmount: number;
    minAngle: number = 35;
    maxAngle: number = 65;
    drawRules : Map<string, any> = new Map();
    currTurtle: Turtle = new Turtle();
    turtleArray: Turtle[] = [];
    oldPos: vec3 = vec3.create();
    tempTurtle: Turtle = new Turtle();
   // tempTurtle: Turtle = currTurtle;
   
     constructor(it: number, min: number, max: number, leaf: number){
        this.iterations = it;
        this.minAngle = min;
        this.maxAngle = max;
        this.leafAmount = leaf;
     }
    
 
    randomAngle(){
        this.angle = Math.random() * (55 - 5) + 5;
    }

    randomAmount(){
        this.amount = Math.random() * (5 - 4.5) + 2.5;
    }
    setString(){
        let axiom = "FFFFX";
        let rule = new expansionRule(axiom, 4);
        rule.fillMap();
        let final = rule.parseGrammar();
        console.log("final string");
        console.log(final);
        this.final = final;
    }
    drawLeaf() {
        let transMat = mat4.create();

        for(let i = 0; i < this.leafAmount; i++)
        {
            transMat = this.currTurtle.getLeafTransformation();
            //transMat = rotMat;
           // mat4.multiply(transMat, scaleMat, transMat);
           
             
             this.leaf1.push(transMat[0], transMat[1], transMat[2], transMat[3]);
             this.leaf2.push(transMat[4], transMat[5], transMat[6], transMat[7]); 
             this.leaf3.push(transMat[8], transMat[9], transMat[10], transMat[11]);
             this.leaf4.push(transMat[12], transMat[13], transMat[14], transMat[15]);
        }
        

        //  transMat = this.currTurtle.getLeafTransformation();
        //  this.leaf1.push(transMat[0], transMat[1], transMat[2], transMat[3]);
        //  this.leaf2.push(transMat[4], transMat[5], transMat[6], transMat[7]); 
        //  this.leaf3.push(transMat[8], transMat[9], transMat[10], transMat[11]);
        //  this.leaf4.push(transMat[12], transMat[13], transMat[14], transMat[15]);


        //  transMat = this.currTurtle.getLeafTransformation();
        //  this.leaf1.push(transMat[0], transMat[1], transMat[2], transMat[3]);
        //  this.leaf2.push(transMat[4], transMat[5], transMat[6], transMat[7]); 
        //  this.leaf3.push(transMat[8], transMat[9], transMat[10], transMat[11]);
        //  this.leaf4.push(transMat[12], transMat[13], transMat[14], transMat[15]);
    }
    moveForward() {
 
      
        

        
        let transMat = mat4.create();
        transMat = this.currTurtle.getTransformation();
        this.col1.push(transMat[0], transMat[1], transMat[2], transMat[3]);
        this.col2.push(transMat[4], transMat[5], transMat[6], transMat[7]); 
        this.col3.push(transMat[8], transMat[9], transMat[10], transMat[11]);
        this.col4.push(transMat[12], transMat[13], transMat[14], transMat[15]);


        if(this.currTurtle.depth > 1)
        {
            this.drawLeaf();
        }

        
        let pos = vec3.create();
        this.randomAmount();
        pos[0] = this.currTurtle.up[0] * this.amount;
        pos[1] = this.currTurtle.up[1] * this.amount;
        pos[2] = this.currTurtle.up[2] * this.amount;
        this.currTurtle.updatePos(pos);

       


      }

      drawBranch()
      {
        
      }

      upRotation() {
        this.randomAngle();
        this.currTurtle.rotateTurtle(2, this.angle);

      
     }


     downRotation() {
        this.randomAngle();
        this.currTurtle.rotateTurtle(2, -this.angle);
     }
   
     leftRotation(){
        this.randomAngle();
       let upMat: mat4 = mat4.create();

        this.currTurtle.rotateTurtle(0, -this.angle);
       
     }


     rightRotation(){
    

        this.randomAngle();
        this.currTurtle.rotateTurtle(0, this.angle);

      }
     
     forwardRotation(){
        this.randomAngle();
        this.currTurtle.rotateTurtle(1, this.angle);
       
     }

     backRotation(){
        this.randomAngle();
        this.currTurtle.rotateTurtle(1, -this.angle);
     }

     saveState() {
        //push turtle on stack and create a new one
        //let tempTurtle = new Turtle();
        //tempTurtle = tempTurtle.newTurtle(this.currTurtle);
       // this.oldPos = tempTurtle.position;
       // tempTurtle.position = this.oldPos
        console.log("save");
       
       // console.log(this.currTurtle.position);
        this.tempTurtle = this.tempTurtle.newTurtle(this.currTurtle);
        this.turtleArray.push(this.tempTurtle);
        //console.log(this.turtleArray[0].position);
        //this.currTurtle = this.currTurtle.newTurtle(this.tempTurtle);
        this.currTurtle.depth += 1;

     }

     revertState(){
        //pop turtle on stack and make that currTurtle
        console.log(this.turtleArray[0].position);
        //this.currTurtle = this.turtleArray.pop();
        console.log("revert");
        this.currTurtle = this.turtleArray.pop();
        console.log(this.currTurtle.position);
        //console.log(newTurtle.position );
     }


    setMap(){
        this.drawRules.set('F', this.moveForward.bind(this));
    
        this.drawRules.set('+', this.leftRotation.bind(this));
        this.drawRules.set('-', this.rightRotation.bind(this));
        this.drawRules.set('/', this.upRotation.bind(this));
        this.drawRules.set('\\', this.downRotation.bind(this));
        this.drawRules.set('*', this.forwardRotation.bind(this));
        this.drawRules.set('&', this.backRotation.bind(this))
        //this.tempTurtle = this.currTurtle;
        this.drawRules.set('[', this.saveState.bind(this));
        this.drawRules.set(']', this.revertState.bind(this));
        //this.drawRules.set('')
    }

    draw()
    {
        for(let i = 0; i < this.final.length; i++)
        {
            let func = this.drawRules.get(this.final[i]);
            if(func)
            {
                func();
            }
        }
    }


   

};
export default drawingRule;