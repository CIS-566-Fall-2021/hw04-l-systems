import { vec3, vec4 } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';

import Turtle from './lsystem/Turtle';
import LSystem from './lsystem/LSystem';
import ExpansionRule from './lsystem/ExpansionRule';
import { readTextFile, toRadian } from './globals';
import Mesh from './geometry/Mesh';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  iterations: 3,
  angle: 30,
  flower_color: [255, 130, 90],
};

let square: Square;
let screenQuad: ScreenQuad;
let cylinder: Mesh;
let star: Mesh;
let base: Mesh;

let time: number = 0.0;

function backgroundSetup() {
  let colorsArray1 = [0.3, 0.2, 0.1, 1.0];

  let col1sArray = [10, 0, 0, 0];
  let col2sArray = [0, 10, 0, 0];
  let col3sArray = [0, 0, 10, 0];
  let col4sArray = [0, -20, 0, 1];

  let colors1: Float32Array = new Float32Array(colorsArray1);
  let col1s: Float32Array = new Float32Array(col1sArray);
  let col2s: Float32Array = new Float32Array(col2sArray);
  let col3s: Float32Array = new Float32Array(col3sArray);
  let col4s: Float32Array = new Float32Array(col4sArray);

  base.setInstanceVBOsTransform(colors1, col1s, col2s, col3s, col4s);
  base.setNumInstances(1);
}

function lsystermSetup() {
  // Init LSystem
  let lsystem: LSystem = new LSystem(controls); //new ExpansionRule(controls));
  lsystem.draw();
  let trunksTransform = lsystem.drawingRule.trunks;
  let flowersTransform = lsystem.drawingRule.flowers;
}

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  //load from obj
  let cylinderObj: string = readTextFile('https://raw.githubusercontent.com/ameliapqy/hw04-l-systems/master/src/obj/cylinder.obj');
  cylinder = new Mesh(cylinderObj, vec3.fromValues(0, 0, 0));
  cylinder.create();

  let baseObj: string = readTextFile('https://raw.githubusercontent.com/ameliapqy/hw04-l-systems/master/src/obj/base.obj');
  base = new Mesh(baseObj, vec3.fromValues(0, 0, 0));
  base.create();

  let starObj: string = readTextFile('https://raw.githubusercontent.com/ameliapqy/hw04-l-systems/master/src/obj/star.obj');
  star = new Mesh(starObj, vec3.fromValues(0, 0, 0));
  star.create();

  backgroundSetup();

  //lsystem
  lsystermSetup();

  // cylinder.setInstanceVBOsTransform(colors1, col1s, col2s, col3s, col4s);
  // cylinder.setNumInstances(1);

  // col1sArray.push(transformation[0]);
  // col1sArray.push(transformation[1]);
  // col1sArray.push(transformation[2]);
  // col1sArray.push(transformation[3]);

  // col2sArray.push(transformation[4]);
  // col2sArray.push(transformation[5]);
  // col2sArray.push(transformation[6]);
  // col2sArray.push(transformation[7]);

  // col3sArray.push(transformation[8]);
  // col3sArray.push(transformation[9]);
  // col3sArray.push(transformation[10]);
  // col3sArray.push(transformation[11]);

  // col4sArray.push(transformation[12]);
  // col4sArray.push(transformation[13]);
  // col4sArray.push(transformation[14]);
  // col4sArray.push(1);

  // //update vbo
  // cylinder.setInstanceVBOTransform2(
  //   new Float32Array(trunksTransform.trans),
  //   new Float32Array(trunksTransform.quat),
  //   new Float32Array(trunksTransform.scale)
  // );

  // star.setInstanceVBOTransform2(
  //   new Float32Array(trunksTransform.trans),
  //   new Float32Array(trunksTransform.quat),
  //   new Float32Array(trunksTransform.scale)
  // );
  // star.setNumInstances(trunksTransform.count);
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

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 50), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

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
    //set LSystem Up

    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      cylinder,
      // star,
      base,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener(
    'resize',
    function () {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.setAspectRatio(window.innerWidth / window.innerHeight);
      camera.updateProjectionMatrix();
      flat.setDimensions(window.innerWidth, window.innerHeight);
    },
    false
  );

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
