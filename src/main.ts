import {vec3, vec4, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Cylinder from './geometry/Cylinder';
import LSystem from './LSystem';
import Cube from './geometry/Cube';


const PI = 3.14159;

let angle: number = PI / 8.0;
let prevAngle = angle;

let iterations = 2.0;
let prevIterations = 2.0;

let forwardLength = 2.0;
let prevForwardLength = 2.0;

let barkColor: vec4 = vec4.fromValues(0.4588, 0.2353, 0.1333, 1.0);
let prevBarkColor: vec4 = vec4.fromValues(0.5, 0.25, 0.125, 1.0);


// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = 
{
  Iterations: 1.0,
  Angle: PI / 8.0,
  ForwardLength: 2.0
};

const colorControl = 
{
  BarkColor: [128, 64, 32]
};

let square: Square;
let cylinder: Cylinder;
let cube: Cube;
let screenQuad: ScreenQuad;
let time: number = 0.0;


function loadScene() {
  square = new Square();
  square.create();
  cylinder = new Cylinder(forwardLength);
  cylinder.create();
  cube = new Cube();
  cube.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  let lSystem: LSystem = new LSystem(angle, iterations, forwardLength, barkColor);
  
  lSystem.expand();

  lSystem.computeDrawingData();

  let offsets: Float32Array = new Float32Array(lSystem.offsetsArray);
  let colors: Float32Array = new Float32Array(lSystem.colorsArray);

  let scale: Float32Array = new Float32Array(lSystem.scaleArray);

  let col0Out: Float32Array = new Float32Array(lSystem.col0);
  let col1Out: Float32Array = new Float32Array(lSystem.col1);
  let col2Out: Float32Array = new Float32Array(lSystem.col2);
  let col3Out: Float32Array = new Float32Array(lSystem.col3);


  let leafOffsets: Float32Array = new Float32Array(lSystem.leafOffsetsArray);

  square.setInstanceVBOs(leafOffsets, colors);
  square.setNumInstances(lSystem.numLeaves); // grid of "particles"

  cylinder.setInstanceVBOs(scale, offsets, colors, col0Out, col1Out, col2Out, col3Out);
  cylinder.setNumInstances(lSystem.numCylinders); // grid of "particles"
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

  gui.add(controls, "Iterations", 0, 5).step(1);
  gui.add(controls, "Angle", -PI / 8.0, PI / 8.0).step(0.01);
  gui.add(controls, "ForwardLength", 0.1, 10.0).step(0.1);

  gui.addColor(colorControl, 'BarkColor');

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

  const camera = new Camera(vec3.fromValues(0, 0, 200), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const instancedLeafShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instancedLeafVert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instancedLeafFrag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() 
  {
    iterations = controls.Iterations;

    angle = controls.Angle;

    forwardLength = controls.ForwardLength;

    barkColor = vec4.fromValues(colorControl.BarkColor[0] / 256.0, 
                                colorControl.BarkColor[1] / 256.0,
                                colorControl.BarkColor[2] / 256.0, 1.0);

    let barkColorDifference: number = Math.abs(barkColor[0] - prevBarkColor[0])
                                    + Math.abs(barkColor[1] - prevBarkColor[1])
                                    + Math.abs(barkColor[2] - prevBarkColor[2]);

    if(angle != prevAngle || iterations != prevIterations 
      || forwardLength != prevForwardLength || barkColorDifference > 0.1)
    {
      prevAngle = angle;
      prevIterations = iterations;
      prevForwardLength = forwardLength;
      prevBarkColor = barkColor;
      loadScene();
    }

    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);

    renderer.render(camera, instancedLeafShader, [square,]);

    renderer.render(camera, instancedShader, [cylinder,]);


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
