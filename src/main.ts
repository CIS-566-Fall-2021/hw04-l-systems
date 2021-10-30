import {mat4, vec3} from 'gl-matrix';
// import * as Stats from 'stats-js';
const Stats = require('stats-js');
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Mesh from './geometry/Mesh';
import Turtle from './Turtle';
import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';
import { isUndefined } from 'util';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  angle1: 30,
  angle2: 70,
  angle3: 100,
  probabilityLsystemExpand1: .4,
  probabilityLsystemExpand2: .2,
  probabilityLsystemExpand3: .2,
  probabilityLsystemExpand4: .2,
  'remake': loadScene,
};

var palette = {
  'Branch Color': [166, 128, 50, 1.],
  'Leaf Color': [77, 180, 50, 1.],
  'Fruit Color': [255, 255, 0, 1.],
}

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let cube: Mesh;
let cylinder: Mesh;
let fruit: Mesh;
let leaf: Mesh;

function degsToRads(deg: number):number {
  return (deg * Math.PI) / 180.0;
}

function loadScene() {

  //ORIGINAL SQUARE RENDER -----------------------------------------------------

  // square = new Square();
  // square.create();
  // screenQuad = new ScreenQuad();
  // screenQuad.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  // let offsetsArray = [];
  // let colorsArray = [];
  // let n: number = 100.0;
  // for(let i = 0; i < n; i++) {
  //   for(let j = 0; j < n; j++) {
  //     offsetsArray.push(i);
  //     offsetsArray.push(j);
  //     offsetsArray.push(0);

  //     colorsArray.push(i / n);
  //     colorsArray.push(j / n);
  //     colorsArray.push(1.0);
  //     colorsArray.push(1.0); // Alpha channel
  //   }
  // }

  // square.setInstanceVBOs(offsets, colors);
  // square.setNumInstances(n * n); // grid of "particles"

  // offsets = new Float32Array(offsetsArray);
  // colors = new Float32Array(colorsArray);

  //TEST CYLINDER RENDER -----------------------------------------------------
  // screenQuad = new ScreenQuad();
  // screenQuad.create();

  // // cube = new Mesh("./cube.obj", vec3.fromValues(0, 0, 0));
  // cylinder = new Mesh("./cylinder_full.obj", vec3.fromValues(0, 0, 0));
  // cylinder.create();

  // //T * R * S

  // let xAxis: vec3 = vec3.fromValues(1, 0, 0);
  // let yAxis: vec3 = vec3.fromValues(0, 1, 0);
  // let zAxis: vec3 = vec3.fromValues(0, 0, 1);

  // let testRotate: mat4 = mat4.create();
  // // mat4.fromScaling(testRotate, vec3.fromValues(1, .1, 1));
  // // mat4.fromRotation(testRotate, degsToRads(90), xAxis);
  // mat4.translate(testRotate, testRotate, vec3.fromValues(5, 0, 0));  
  // // mat4.rotate(testRotate, testRotate, degsToRads(100), zAxis);
  // // mat4.rotate(testRotate, testRotate, degsToRads(50), yAxis);
  // mat4.rotate(testRotate, testRotate, degsToRads(45), xAxis);
  // mat4.scale(testRotate, testRotate, vec3.fromValues(1, .5, 1));

  
  // let transformCols0Array = [1, 0, 0, 0];
  // let transformCols1Array = [0, 1, 0, 0];
  // let transformCols2Array = [0, 0, 1, 0];
  // let transformCols3Array = [0, 0, 0, 1];
  // for (let i = 0; i < 4; i++) {
  //   transformCols0Array.push(testRotate[0 + i])
  //   transformCols1Array.push(testRotate[4 + i])
  //   transformCols2Array.push(testRotate[8 + i])
  //   transformCols3Array.push(testRotate[12 + i])
  // }
  // let colorsArray = [1, 1, 1, 1, .5, .5, .5, 1];

  // let transformCols0: Float32Array = new Float32Array(transformCols0Array);
  // let transformCols1: Float32Array = new Float32Array(transformCols1Array);
  // let transformCols2: Float32Array = new Float32Array(transformCols2Array);
  // let transformCols3: Float32Array = new Float32Array(transformCols3Array);
  // let colors: Float32Array = new Float32Array(colorsArray);

  // cylinder.setInstanceVBOs(transformCols0, transformCols1, transformCols2, transformCols3, colors);
  // // cube.setNumInstances(n * n);
  // cylinder.setNumInstances(2);

  //TEST LSYSTEM RENDER -----------------------------------------------------

  //Set Up Instance Rendering
  let xAxis: vec3 = vec3.fromValues(1, 0, 0);
  let yAxis: vec3 = vec3.fromValues(0, 1, 0);
  let zAxis: vec3 = vec3.fromValues(0, 0, 1);
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // cylinder = new Mesh("./cylinder.obj", vec3.fromValues(0, 0, 0));
  cylinder = new Mesh("cylinder.obj", vec3.fromValues(0, 0, 0));
  cylinder.create();
  let transformCols0Array: Array<number> = [];
  let transformCols1Array: Array<number> = [];
  let transformCols2Array: Array<number> = [];
  let transformCols3Array: Array<number> = [];
  let colorsArray: Array<number> = [];
  let numInstancesCylinder: number = 0;

  // fruit = new Mesh("./fruit.obj", vec3.fromValues(0, 0, 0));
  fruit = new Mesh("fruit.obj", vec3.fromValues(0, 0, 0));
  fruit.create();
  let transformCols0ArrayFruit: Array<number> = [];
  let transformCols1ArrayFruit: Array<number> = [];
  let transformCols2ArrayFruit: Array<number> = [];
  let transformCols3ArrayFruit: Array<number> = [];
  let colorsArrayFruit: Array<number> = [];
  let numInstancesFruit: number = 0;

  // leaf = new Mesh("./leaf.obj", vec3.fromValues(0, 0, 0));
  leaf = new Mesh("leaf.obj", vec3.fromValues(0, 0, 0));
  leaf.create();
  let transformCols0ArrayLeaf: Array<number> = [];
  let transformCols1ArrayLeaf: Array<number> = [];
  let transformCols2ArrayLeaf: Array<number> = [];
  let transformCols3ArrayLeaf: Array<number> = [];
  let colorsArrayLeaf: Array<number> = [];
  let numInstancesLeaf: number = 0;

  //Set Up LSystem Expansion Rules, Expand LSystem String
  let expansionRules : Map<string, ExpansionRule> = new Map();
  //F = draw forward (branch)
  //+ = positive angle rotate around Z
  //- = negative angle rotate around Z
  //* = positive angle rotate around Y
  /// = negative angle rotate around Y
  //^ = positive angle rotate around X
  //% = negative angle rotate around X
  expansionRules.set("F", new ExpansionRule([["F[+F][-F][^F][%F][++^^F][--%%F]", controls.probabilityLsystemExpand1], ["F[+F][-F]", controls.probabilityLsystemExpand2], ["F[^F][%F]", controls.probabilityLsystemExpand3], ["D", controls.probabilityLsystemExpand4]]));
  // expansionRules.set("F", new ExpansionRule([["F[+F][-F][^F][%F]", 1]]));
  // expansionRules.set("F", new ExpansionRule([["F[+F][-F]", 1]]));

  let lsystemString: string = "F[+F][-F][^F][%F][++^^F][--%%F]";
  let numExpansions: number = 4;
  for (let i = 0; i < numExpansions; i++) {
    let newLsystemString: string = "";
    for (let j = 0; j < lsystemString.length; j++) {
      let curChar: string = lsystemString.charAt(j);
      let expansionRule: ExpansionRule = expansionRules.get(curChar);
      if (isUndefined(expansionRule)) {
        newLsystemString = newLsystemString.concat(curChar);
      } else {
        let newString: string = expansionRule.pickRandom();
        newLsystemString = newLsystemString.concat(newString);
      }
    }
    lsystemString = newLsystemString;
  }
  // console.log(lsystemString);

  //Set Up Drawing Rules, Draw LSystem (Turtles)
  let branchColor: vec3 = vec3.fromValues(palette['Branch Color'][0] / 255, palette['Branch Color'][1] / 255, palette['Branch Color'][2] / 255);
  let leafColor: vec3 = vec3.fromValues(palette['Leaf Color'][0] / 255, palette['Leaf Color'][1] / 255, palette['Leaf Color'][2] / 255);
  let fruitColor: vec3 = vec3.fromValues(palette['Fruit Color'][0] / 255, palette['Fruit Color'][1] / 255, palette['Fruit Color'][2] / 255);
  let curTurtle: Turtle = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0), 0, 15, 25, branchColor, leafColor, fruitColor, numExpansions);
  let drawingRules : Map<string, DrawingRule> = new Map();
  // drawingRules.set("F", new DrawingRule([[curTurtle.moveForward.bind(curTurtle, 10), 1]]));
  let angle1: number = controls.angle1;
  let angle2: number = controls.angle2; //40
  let angle3: number = controls.angle3; //50
  drawingRules.set("F", new DrawingRule([[curTurtle.moveForward.bind(curTurtle), 1]]));
  drawingRules.set("D", new DrawingRule([[curTurtle.moveForward.bind(curTurtle), 1]]));
  drawingRules.set("+", new DrawingRule([[curTurtle.rotateZ.bind(curTurtle, degsToRads(angle1)), .5], [curTurtle.rotateZ.bind(curTurtle, degsToRads(angle2)), .25], [curTurtle.rotateZ.bind(curTurtle, degsToRads(angle3)), .25]]));
  drawingRules.set("-", new DrawingRule([[curTurtle.rotateZ.bind(curTurtle, degsToRads(-angle1)), .5], [curTurtle.rotateZ.bind(curTurtle, degsToRads(-angle2)), .25], [curTurtle.rotateZ.bind(curTurtle, degsToRads(-angle3)), .25]]));
  drawingRules.set("*", new DrawingRule([[curTurtle.rotateY.bind(curTurtle, degsToRads(angle2)), .5], [curTurtle.rotateY.bind(curTurtle, degsToRads(angle3)), .25], [curTurtle.rotateY.bind(curTurtle, degsToRads(angle1)), .25]]));
  drawingRules.set("/", new DrawingRule([[curTurtle.rotateY.bind(curTurtle, degsToRads(-angle2)), .5], [curTurtle.rotateY.bind(curTurtle, degsToRads(-angle3)), .25], [curTurtle.rotateY.bind(curTurtle, degsToRads(-angle1)), .25]]));
  drawingRules.set("^", new DrawingRule([[curTurtle.rotateX.bind(curTurtle, degsToRads(angle3)), .5], [curTurtle.rotateX.bind(curTurtle, degsToRads(angle1)), .25], [curTurtle.rotateX.bind(curTurtle, degsToRads(angle2)), .25]]));
  drawingRules.set("%", new DrawingRule([[curTurtle.rotateX.bind(curTurtle, degsToRads(-angle3)), .5], [curTurtle.rotateX.bind(curTurtle, degsToRads(-angle1)), .25], [curTurtle.rotateX.bind(curTurtle, degsToRads(-angle2)), .25]]));

  let trunk: Boolean = false;
  let turtleStack: Array<Turtle> = new Array<Turtle>();
  turtleStack.push(curTurtle);
  for (let i = 0; i < lsystemString.length; i++) {
    let curChar: string = lsystemString.charAt(i);
    switch(curChar) {
      case "[": {
        turtleStack.push(curTurtle.clone());
        curTurtle.recursionDepth++;
        break;
      }
      case "]": {
        curTurtle = turtleStack.pop();
        drawingRules.set("F", new DrawingRule([[curTurtle.moveForward.bind(curTurtle), 1]]));
        drawingRules.set("D", new DrawingRule([[curTurtle.moveForward.bind(curTurtle), 1]]));
        drawingRules.set("+", new DrawingRule([[curTurtle.rotateZ.bind(curTurtle, degsToRads(angle1)), .5], [curTurtle.rotateZ.bind(curTurtle, degsToRads(angle2)), .25], [curTurtle.rotateZ.bind(curTurtle, degsToRads(angle3)), .25]]));
        drawingRules.set("-", new DrawingRule([[curTurtle.rotateZ.bind(curTurtle, degsToRads(-angle1)), .5], [curTurtle.rotateZ.bind(curTurtle, degsToRads(-angle2)), .25], [curTurtle.rotateZ.bind(curTurtle, degsToRads(-angle3)), .25]]));
        drawingRules.set("*", new DrawingRule([[curTurtle.rotateY.bind(curTurtle, degsToRads(angle2)), .5], [curTurtle.rotateY.bind(curTurtle, degsToRads(angle3)), .25], [curTurtle.rotateY.bind(curTurtle, degsToRads(angle1)), .25]]));
        drawingRules.set("/", new DrawingRule([[curTurtle.rotateY.bind(curTurtle, degsToRads(-angle2)), .5], [curTurtle.rotateY.bind(curTurtle, degsToRads(-angle3)), .25], [curTurtle.rotateY.bind(curTurtle, degsToRads(-angle1)), .25]]));
        drawingRules.set("^", new DrawingRule([[curTurtle.rotateX.bind(curTurtle, degsToRads(angle3)), .5], [curTurtle.rotateX.bind(curTurtle, degsToRads(angle1)), .25], [curTurtle.rotateX.bind(curTurtle, degsToRads(angle2)), .25]]));
        drawingRules.set("%", new DrawingRule([[curTurtle.rotateX.bind(curTurtle, degsToRads(-angle3)), .5], [curTurtle.rotateX.bind(curTurtle, degsToRads(-angle1)), .25], [curTurtle.rotateX.bind(curTurtle, degsToRads(-angle2)), .25]]));
        break;
      }
      default: {
        let drawingRule: DrawingRule = drawingRules.get(curChar);
        if (!isUndefined(drawingRule)) {
          let result: any = drawingRule.pickRandom();
          if (!trunk) {
            trunk = true;
            result = drawingRule.pickFirst();
          }
          if (!isUndefined(result)) {
            let [transformCols0ArrayTemp, transformCols1ArrayTemp, transformCols2ArrayTemp, transformCols3ArrayTemp, colorsArrayTemp, numInstancesCylinderTemp,
                 transformCols0ArrayFruitTemp, transformCols1ArrayFruitTemp, transformCols2ArrayFruitTemp, transformCols3ArrayFruitTemp, colorsArrayFruitTemp, numInstancesFruitTemp,
                 transformCols0ArrayLeafTemp, transformCols1ArrayLeafTemp, transformCols2ArrayLeafTemp, transformCols3ArrayLeafTemp, colorsArrayLeafTemp, numInstancesLeafTemp] = result;
            transformCols0Array = transformCols0Array.concat(transformCols0ArrayTemp);
            transformCols1Array = transformCols1Array.concat(transformCols1ArrayTemp);
            transformCols2Array = transformCols2Array.concat(transformCols2ArrayTemp);
            transformCols3Array = transformCols3Array.concat(transformCols3ArrayTemp);
            colorsArray = colorsArray.concat(colorsArrayTemp);
            numInstancesCylinder += numInstancesCylinderTemp;

            transformCols0ArrayFruit = transformCols0ArrayFruit.concat(transformCols0ArrayFruitTemp);
            transformCols1ArrayFruit = transformCols1ArrayFruit.concat(transformCols1ArrayFruitTemp);
            transformCols2ArrayFruit = transformCols2ArrayFruit.concat(transformCols2ArrayFruitTemp);
            transformCols3ArrayFruit = transformCols3ArrayFruit.concat(transformCols3ArrayFruitTemp);
            colorsArrayFruit = colorsArrayFruit.concat(colorsArrayFruitTemp);
            numInstancesFruit += numInstancesFruitTemp;

            transformCols0ArrayLeaf = transformCols0ArrayLeaf.concat(transformCols0ArrayLeafTemp);
            transformCols1ArrayLeaf = transformCols1ArrayLeaf.concat(transformCols1ArrayLeafTemp);
            transformCols2ArrayLeaf = transformCols2ArrayLeaf.concat(transformCols2ArrayLeafTemp);
            transformCols3ArrayLeaf = transformCols3ArrayLeaf.concat(transformCols3ArrayLeafTemp);
            colorsArrayLeaf = colorsArrayLeaf.concat(colorsArrayLeafTemp);
            numInstancesLeaf += numInstancesLeafTemp;

          }
        }
      }
    }
  }
  
  //PLATFORM
  let transformMat: mat4 = mat4.create();
  mat4.translate(transformMat, transformMat, vec3.fromValues(0, 58, 0));
  mat4.scale(transformMat, transformMat, vec3.fromValues(40, 3, 40));
  for (let j = 0; j < 4; j++) {
    transformCols0Array.push(transformMat[0 + j]);
    transformCols1Array.push(transformMat[4 + j]);
    transformCols2Array.push(transformMat[8 + j]);
    transformCols3Array.push(transformMat[12 + j]);
  }
  colorsArray.push(.6, .3, .1, 1);
  numInstancesCylinder++;

  //Set VBOs/Instancing
  let transformCols0: Float32Array = new Float32Array(transformCols0Array);
  let transformCols1: Float32Array = new Float32Array(transformCols1Array);
  let transformCols2: Float32Array = new Float32Array(transformCols2Array);
  let transformCols3: Float32Array = new Float32Array(transformCols3Array);
  let colors: Float32Array = new Float32Array(colorsArray);
  cylinder.setInstanceVBOs(transformCols0, transformCols1, transformCols2, transformCols3, colors);
  cylinder.setNumInstances(numInstancesCylinder);

  let transformCols0Fruit: Float32Array = new Float32Array(transformCols0ArrayFruit);
  let transformCols1Fruit: Float32Array = new Float32Array(transformCols1ArrayFruit);
  let transformCols2Fruit: Float32Array = new Float32Array(transformCols2ArrayFruit);
  let transformCols3Fruit: Float32Array = new Float32Array(transformCols3ArrayFruit);
  let colorsFruit: Float32Array = new Float32Array(colorsArrayFruit);
  fruit.setInstanceVBOs(transformCols0Fruit, transformCols1Fruit, transformCols2Fruit, transformCols3Fruit, colorsFruit);
  fruit.setNumInstances(numInstancesFruit);

  let transformCols0Leaf: Float32Array = new Float32Array(transformCols0ArrayLeaf);
  let transformCols1Leaf: Float32Array = new Float32Array(transformCols1ArrayLeaf);
  let transformCols2Leaf: Float32Array = new Float32Array(transformCols2ArrayLeaf);
  let transformCols3Leaf: Float32Array = new Float32Array(transformCols3ArrayLeaf);
  let colorsLeaf: Float32Array = new Float32Array(colorsArrayLeaf);
  leaf.setInstanceVBOs(transformCols0Leaf, transformCols1Leaf, transformCols2Leaf, transformCols3Leaf, colorsLeaf);
  leaf.setNumInstances(numInstancesLeaf);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'angle1', 0, 180).step(5);
  gui.add(controls, 'angle2', 0, 180).step(5);
  gui.add(controls, 'angle3', 0, 180).step(5);
  gui.addColor(palette, 'Branch Color');
  gui.addColor(palette, 'Leaf Color');
  gui.addColor(palette, 'Fruit Color');
  gui.add(controls, 'probabilityLsystemExpand1', 0, 1);
  gui.add(controls, 'probabilityLsystemExpand2', 0, 1);
  gui.add(controls, 'probabilityLsystemExpand3', 0, 1);
  gui.add(controls, 'probabilityLsystemExpand4', 0, 1);
  gui.add(controls, 'remake');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(30, 100, 90), vec3.fromValues(0, 100, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST)
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      // square,
      // cube,
      cylinder,
      fruit,
      leaf,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
