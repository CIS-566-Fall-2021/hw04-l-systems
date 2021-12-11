import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';
import Turtle from "./Turtle";
import {mat4} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import { copyFile } from 'fs';
import { networkInterfaces } from 'os';

class LSystem {
    iteration: number = 0;
    axiom: string = "";
    rulesExpan: Map<string, ExpansionRule> = new Map();
    rulesDraw: DrawingRule;
    fullGrammar: string = "";
    myTurtle: Turtle = new Turtle(vec4.fromValues(50, 20, 0, 1), vec4.fromValues(0, 1, 0, 0), vec4.fromValues(1, 0, 0, 0), vec4.fromValues(1, 0, 0, 0), 1, 1.8);
    turtleStack: Array<Turtle> = new Array();
    angle: number= 10;
    color: vec3;
    leafScale: number;

    Btransformations: Array<mat4> = new Array();
    Bcolors: Array<vec4> = new Array();

    Ytransformations: Array<mat4> = new Array();
    Ycolors: Array<vec4> = new Array();

    Ltransformations: Array<mat4> = new Array();
    Lcolors: Array<vec4> = new Array();

    Htransformations: Array<mat4> = new Array();
    Hcolors: Array<vec4> = new Array();

    Ttransformations: Array<mat4> = new Array();
    Tcolors: Array<vec4> = new Array();
    

    constructor(a: string, iter: number, color: vec3, leaf: number) {
        this.iteration = iter;
        this.axiom = a;
        this.color = color;
        this.leafScale = leaf;
        this.makeExpansionRules();
        this.createFullGrammar();
        this.findTransforms();
    }

    makeExpansionRules() {
        var r0 = new ExpansionRule(new Array<string>("[[[[AB]++++BA]+++J"), new Array<number>(1.0));
        this.rulesExpan.set('J', r0);

        var r1 = new ExpansionRule(new Array<string>("TJ"), new Array<number>(1.0));
        this.rulesExpan.set('X', r1);

        var r2 = new ExpansionRule(new Array<string>("<<[**L][^^L]FF<<FF<<FF<<HB", "**[^^L][<<L]F**FF**FF**B", "^^[<<L][**L]FF^^FF^^FF^^B"), new Array<number>(0.33, 0.33, 0.33));
        this.rulesExpan.set('A', r2);

        var r3 = new ExpansionRule(new Array<string>("//[++L][&&L]FF//FF//FF//A", "++[&&L][//L]FF++FF++FF++HA", "&&[//L][++L]FF&&FF&&FF&&A"), new Array<number>(0.33, 0.33, 0.33));
        this.rulesExpan.set('B', r3);

        var r4 = new ExpansionRule(new Array<string>("FFT"), new Array<number>(1.0));
        this.rulesExpan.set('T', r4);
    }

    createFullGrammar() {
        var current = this.axiom;
        var count = 0;
        while(count < this.iteration) {
            count ++;
            var idx = 0;
            var updated = "";
            while(idx < current.length) {
                var k = current.substring(idx, idx + 1);
                if(this.rulesExpan.has(k)){
                    var r: any = this.rulesExpan.get(k);
                    r.createRule();
                    updated += r.output;
                } else {
                    updated += k;
                }
                idx ++;
            }
            current = updated;
        }
        this.fullGrammar = current;
    }

    findTransforms() {
        var idx = 0;
        while(idx < this.fullGrammar.length) {
            var k = this.fullGrammar.substring(idx, idx + 1);
            this.rulesDraw = new DrawingRule(this.myTurtle, k);
            this.myTurtle = this.rulesDraw.turtle;
            if(k == 'F') {
                var s = 1 - this.myTurtle.scale;
                var r = 0.2 + (this.color[0] - 0.2) * (s * s);
                var g = 0.2 + (this.color[1] - 0.2) * (s * s);
                var b = 0.2 + (this.color[2] - 0.2) * (s * s);
                var color = vec4.fromValues(r, g, b, 1);
                this.myTurtle.decreaseScale(0.98);
                this.Bcolors.push(color);
                this.Btransformations.push(this.myTurtle.getTransform());
            }
            if(this.rulesDraw.isTurn){
                var r = 0.2 + (this.color[0] - 0.2) * (s * s);
                var g = 0.2 + (this.color[1] - 0.2) * (s * s);
                var b = 0.2 + (this.color[2] - 0.2) * (s * s);
                var color = vec4.fromValues(r, g, b, 1);
                this.Tcolors.push(color);
                this.Ttransformations.push(this.myTurtle.getTransform());
            }
                
            if(k == '[') {
                let d = this.myTurtle.depth;
                let copy: Turtle = new Turtle(vec4.fromValues(this.myTurtle.pos[0], this.myTurtle.pos[1], this.myTurtle.pos[2], this.myTurtle.pos[3]),
                vec4.fromValues(this.myTurtle.forward[0], this.myTurtle.forward[1], this.myTurtle.forward[2], this.myTurtle.forward[3]),
                vec4.fromValues(this.myTurtle.right[0], this.myTurtle.right[1], this.myTurtle.right[2], this.myTurtle.right[3]),
                vec4.fromValues(this.myTurtle.up[0], this.myTurtle.up[1], this.myTurtle.up[2], this.myTurtle.up[3]),
                d + 1, this.myTurtle.scale);
                this.turtleStack.push(copy);
            }
            if(k == ']'){
                let popped: Turtle = this.turtleStack.pop();
                this.myTurtle = new Turtle(popped.pos, popped.forward, popped.right, popped.up, popped.depth, popped.scale);
            }
            if(k == 'L' && this.myTurtle.scale < this.iteration * 0.08) {
                var color = vec4.fromValues(r, g, b, 1);
                this.Lcolors.push(color);
                this.Ltransformations.push(this.myTurtle.getTransformCustomScale(this.leafScale));
            }
            if(k == 'H' && this.myTurtle.scale < this.iteration * 0.04) {
                var color = vec4.fromValues(0, 0, 0, 1);
                this.Hcolors.push(color);
                this.Htransformations.push(this.myTurtle.getTranslationMatrix());
            }
            idx ++;
        }
    }

    getTFloat32Array(arr: Array<mat4>, mode: number): Float32Array {
        let T = [];
        var idx = 0;
        while(idx < arr.length) {
          var transform: mat4 = arr[idx];
          if(mode == 1){
            for(var i = 0; i < 4; i++) {
                T.push(transform[i]);
            }
          }
          if(mode == 2) {
            for(var i = 0; i < 4; i++) {
                T.push(transform[4 + i]);
            }
          }
          if(mode == 3) {
            for(var i = 0; i < 4; i++) {
                T.push(transform[8 + i]);
            }
          }
          if(mode == 4) {
            for(var i = 0; i < 4; i++) {
                T.push(transform[12 + i]);
            }
          }
          idx ++;
        }
        let Tarray: Float32Array = new Float32Array(T);
        return Tarray;
    }

    getCFloat32Array(arr: Array<vec4>): Float32Array {
        var idx = 0;
        let colorsArray = [];
        while(idx < arr.length) {
          var c: vec4 = arr[idx];
          colorsArray.push(c[0]);
          colorsArray.push(c[1]);
          colorsArray.push(c[2]);
          colorsArray.push(c[3]);
          idx ++;
        }
        let colors: Float32Array = new Float32Array(colorsArray);
        return colors;
    }

};

export default LSystem;