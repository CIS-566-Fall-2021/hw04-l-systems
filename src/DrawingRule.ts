import {vec3,vec4,mat4,quat} from 'gl-matrix'
import { start } from 'repl';
import { generateRandomNumber } from './globals';
import Turtle from './Turtle';
import Leaf from './geometry/Leaf';
import { l_system_control } from './main';

export function update_vbo(instance:InstanceInfo,obj:any){
    // setting up the vbo using instance info from drawing rule
    let trans = new Float32Array(instance.trans);
    let quat = new Float32Array(instance.quat);
    let scale = new Float32Array(instance.scale);
    obj.setInstanceVBOs(trans,quat,scale);
    obj.setNumInstances(instance.count);
}

export class InstanceInfo{
    trans: number[]=[];
    quat:number[]=[];
    scale:number[]=[];
    count:number=0;
};

export class DrawingRule{
    // instance info for l-system rendering
    branch_info:InstanceInfo= new InstanceInfo();
    leaf_info_red:InstanceInfo = new InstanceInfo();
    leaf_info_green:InstanceInfo = new InstanceInfo();
    leaf_info_orange:InstanceInfo = new InstanceInfo();
    
    turtles:Array<Turtle> = new Array(); // turtle stack
    current_turtle:Turtle;
    drawingRule: Map<string, any> = new Map();// map character to drawing functions
    
    rotate_angle:number;
    twist_angle:number;
    leaf_level:number;
    leaf_probability:number;
    constructor(start_position:vec3){
        console.log("drawingRule created");

        // set up the turtle
        let t = new Turtle(start_position, // position
                    vec3.fromValues(0,1,0), // aim
                    vec3.fromValues(2.0,1.0,2.0), //scale
                    0.18, //step
                    vec3.fromValues(0,1,0), //up
                    quat.fromValues(0,0,0,1), //quat
                    0); //level

                    
        
        this.turtles.push(t);

        this.current_turtle = this.turtles[0];
        
        
        // set up drawing rule map
        this.drawingRule.set('F', this.drawForward.bind(this));
        this.drawingRule.set('J', this.drawLeaf.bind(this));
        this.drawingRule.set('[',this.branchIn.bind(this));
        this.drawingRule.set(']',this.branchOut.bind(this));
        this.drawingRule.set('+',this.rotateUpPos.bind(this));
        this.drawingRule.set('-',this.rotateUpNeg.bind(this));
        this.drawingRule.set('\\',this.rotateLookPos.bind(this));
        this.drawingRule.set('/',this.rotateLookNeg.bind(this));
        this.drawingRule.set('^',this.rotateRightPos.bind(this));
        this.drawingRule.set('&',this.rotateRightNeg.bind(this));
        
        // set up some parameter
        this.rotate_angle = l_system_control.rotate_Angle;
        this.twist_angle = l_system_control.randomTwistAngle;
        this.leaf_level = l_system_control.leaves_level;
        this.leaf_probability = l_system_control.leaf_probability;
    };      
    
    getrndAngle(){
        let p = Math.random();
        if(p>0&&p<0.2){return this.rotate_angle/1.6;}
        else if(p>0.2&&p<0.4){return this.rotate_angle/1.3;}
        else if(p>0.4&&p<0.6){return this.rotate_angle;}
        else if(p>0.6&&p<0.8){return this.rotate_angle*1.3;}
        return this.rotate_angle*1.6;
    }



    draw(grammar:string){
        
        for (let i = 0; i < grammar.length; i++) {
             if(this.current_turtle.scale[0]<0.0002){
                 continue; // prevent infinite growing
             }
            let draw_func = this.drawingRule.get(grammar.charAt(i));
            if(draw_func) draw_func();
        }
    }

    // drawing function
    // F - move forward
    drawForward(){
       let t = this.current_turtle;

       t.scale[0] *= 0.98;
       t.scale[2] *= 0.98;
        
        t.rotate(t.getUp(), this.twist_angle*(Math.random()-0.5));
        t.rotate(t.getRight(),this.twist_angle*(Math.random()-0.5));

       this.branch_info.scale.push(t.scale[0],t.scale[1],t.scale[2]);
       this.branch_info.quat.push(t.quaternion[0],t.quaternion[1],t.quaternion[2],t.quaternion[3]);
       this.branch_info.trans.push(t.position[0],t.position[1],t.position[2]);
       this.branch_info.count++;

       t.forward();
       
    }

    drawLeaf(){

        // prevent leaf grow in the low level
        let t = this.current_turtle.branch();
        if(t.level<this.leaf_level)return;

        var leaf_info:InstanceInfo;
        
        // Random leaf option
        let p = Math.random();
        if(p>this.leaf_probability)return;
        if(p<0.6)
            leaf_info = this.leaf_info_red;
        else if(p<0.9)
            leaf_info = this.leaf_info_orange;
        else
            leaf_info = this.leaf_info_green;

        // adding random some twist
        t.rotate(t.getUp(), 2*this.twist_angle*(Math.random()-0.5));
        t.rotate(t.getRight(),2*this.twist_angle*(Math.random()-0.5));

        leaf_info.scale.push(1.0,1.0,1.0);
        leaf_info.quat.push(t.quaternion[0],t.quaternion[1],t.quaternion[2],t.quaternion[3]);
        leaf_info.trans.push(t.position[0],t.position[1],t.position[2]);
        leaf_info.count++;
    }

    //[]
    branchIn(){
        
        this.current_turtle.scale[0] *=0.98;
        this.current_turtle.scale[1] *=0.98;
        this.current_turtle.scale[2] *=0.98;
        let newTurtle: Turtle = this.current_turtle.branch();
        newTurtle.level += 1;
        let scale_factor = 0.25*(Math.random()-0.5) +0.5;
        newTurtle.scale[0] *= scale_factor;
        newTurtle.scale[2] *= scale_factor;
        this.turtles.push(this.current_turtle);
        this.current_turtle = newTurtle;

    }
    branchOut(){
        this.current_turtle = this.turtles.pop();
    }
    rotateLookPos(){
        let t = this.current_turtle;
        t.rotate(t.getUp(), -this.getrndAngle());
        t.rotate(t.getLook(), -this.getrndAngle());
    }
    rotateLookNeg(){
        let t = this.current_turtle;
        t.rotate(t.getUp(), this.getrndAngle());
        t.rotate(t.getLook(), this.getrndAngle());
    }

    rotateRightPos(){
        let t = this.current_turtle;
        t.rotate(t.getLook(),  this.getrndAngle());
        t.rotate(t.getRight(),  this.getrndAngle());
    }
    rotateRightNeg(){
       
        let t = this.current_turtle;
        t.rotate(t.getLook(),  -this.getrndAngle());
        t.rotate(t.getRight(),  -this.getrndAngle());
    }
    rotateUpPos(){
        let t = this.current_turtle;
        t.rotate(t.getUp(),  this.getrndAngle());
    }
    
    rotateUpNeg(){
        let t = this.current_turtle;
        t.rotate(t.getUp(),  -this.getrndAngle());
    }
}
export function leaf_floor(info:InstanceInfo,leaf:Leaf,num:number){
    leaf.create();
    for(var i = 0; i< num; i++){
      let q: quat = quat.create();
      quat.setAxisAngle(q, vec3.fromValues(1,0,0),  Math.PI/2.0);
      let q2: quat = quat.create();
      quat.setAxisAngle(q2,vec3.fromValues(0,0,1),2*Math.PI*(Math.random()-0.5));
      quat.multiply(q,q,q2);
      info.trans.push(generateRandomNumber(-30,30),0.00001+Math.random()*0.1,generateRandomNumber(-25,15));
      info.scale.push(1,1,1);
      info.quat.push(q[0],q[1],q[2],q[3]);
      info.count++;
    }
    update_vbo(info,leaf);
  }
export default DrawingRule;