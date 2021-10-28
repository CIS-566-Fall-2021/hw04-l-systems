import {vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Cylinder from './geometry/Cylinder';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import LSystem from './LSystem';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Mesh from './geometry/Mesh';
import cylinderObjStr from './geometry/cylinderObj';
import flowerObj from './flowerObj';
import altLeafObj from './geometry/AltLeafObj';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  angle: 30,
  iterations: 6,
  curvedBranchProbability: 0.2
};

let prevAngle = 30;
let prevIterations = 6;
let prevCurvedBranchProbability = 0.2;

let cylinder: Mesh;
let flower: Mesh;
let ground: Cylinder;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let lsystem: LSystem;
let expandedGrammar: string;

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

  gui.add(controls, 'angle', 10, 90).step(1);
  gui.add(controls, 'iterations', 1, 8).step(1);
  gui.add(controls, 'curvedBranchProbability', 0.0, 0.2).step(0.01);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  gl.enable(gl.DEPTH_TEST);

  // Initial call to load scene
  lsystem = new LSystem(controls.iterations);
  lsystem.setGrammar(controls.angle, controls.curvedBranchProbability);
  lsystem.expandGrammar();
  cylinder = new Mesh(altLeafObj, vec3.fromValues(0, 0, 0));
  flower = new Mesh(flowerObj, vec3.fromValues(0, 0, 0));
  lsystem.draw(cylinder, flower);

  screenQuad = new ScreenQuad();
  screenQuad.create();

  ground = new Mesh(altLeafObj, vec3.fromValues(0, 0, 0));
  ground.create();
  ground.setNumInstances(1);

  const camera = new Camera(vec3.fromValues(0, -1, 2), vec3.fromValues(0, -1, -20));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const groundShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/ground-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/ground-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    if (controls.angle != prevAngle || controls.iterations != prevIterations || controls.curvedBranchProbability != prevCurvedBranchProbability){
      prevAngle = controls.angle;
      prevIterations = controls.iterations;
      prevCurvedBranchProbability = controls.curvedBranchProbability;
      lsystem = new LSystem(controls.iterations);
      lsystem.setGrammar(controls.angle, controls.curvedBranchProbability);
      lsystem.expandGrammar();
      cylinder = new Mesh(cylinderObjStr, vec3.fromValues(0, 0, 0));
      flower = new Mesh(flowerObj, vec3.fromValues(0, 0, 0));
      lsystem.draw(cylinder, flower);
    }
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    groundShader.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, groundShader, [ground]);
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      cylinder, flower
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
