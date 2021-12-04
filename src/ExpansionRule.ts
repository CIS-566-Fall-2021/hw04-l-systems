import {vec3,vec4,mat4} from 'gl-matrix'
import { stringify } from 'querystring';
import { l_system_control } from './main';


export class ExpansionRule {
    expansionRule: Map<string, any> = new Map();
    axiom: string;
    expanded_string: string;

    constructor(axiom : string) {
        this.axiom = axiom;
        // set up expansion rule
        this.expansionRule.set('A', this.A.bind(this));
        this.expansionRule.set('B', this.B.bind(this));
        this.expansionRule.set('F', this.F.bind(this));
    }

    // Rules with probability
    A() {
        let rand = Math.random();
        if (rand < 0.8) return 'F[/B][\\B][\\\B]FA';    
        else return  'FF[/B][\\\\\\^^^B]FB';            
    }

    B() { 
        let rand = Math.random();
        if (rand < 0.3) return "FF[FFA]FFFFFFAJ";  // 30%
        else if(rand < (0.95))return 'FF[FJFJ]FFF[/BJ]FFJFAJ';    // 65%
        else return "FFFFFFFFJJAJ" // 5%
    }

    F(){
        let rand = Math.random();
        if (rand < 0.3) return "F";  // 30%
        else if(rand < (1-l_system_control.branch_extend_probability))return 'F';    
        else return "FF" // extend
    }

    // expand single character
    expand_char(char_to_expand: string) {
        let expanded = this.expansionRule.get(char_to_expand);
        return expanded ? expanded() : char_to_expand;
    }

    // expand the axiom and save result.
    expand(iter:number){

       let res : string = this.axiom;
       for(let i = 0; i < iter; i++){
           let temp:string = "";
           for(let letter of res){
              temp+=this.expand_char(letter);
           }
           
           res = temp;
        }
        this.expanded_string = res;
        
    }

};
