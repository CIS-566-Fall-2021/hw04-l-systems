import {vec3, vec4, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import LSystemProcessor from './lsystem/lsystemprocessor'
import Camera from './Camera';
import {gl, setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Plane from './geometry/Plane';

function loadFileSync(path:string) {
  let request = new XMLHttpRequest();
  request.open("GET", path, false);
  request.send();
  if (request.status !== 200) {
    alert('Cannot load ' + path);
  }

  return request.responseText;
}

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  angle: 0.35,
  moveJitter: -5,
  disableChance: 0.05,
  iterations: 3,
  rotateVariance: 0.2,
  'Regenerate': regenerate
};

let square: Square;
let plane: Plane;
let screenQuad: ScreenQuad;
let time: number = 0.0;

function regenerate() {
  square.destory();
  screenQuad.destory();
  plane.destory();
  loadScene();
}

function loadScene() {
  //square = new Mesh(loadFileSync('./src/cylinder1.obj'), vec3.fromValues(0,0,0)); //new Square();
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  plane = new Plane(1, 0.50);
  plane.create();

  let mats: Array<mat4> = [];
  let colors: Array<vec4> = [];
  let proc = new LSystemProcessor(function(matTrans: mat4, type: string) {
    mats.push(matTrans);

    if (type === "leaf") {
      colors.push(vec4.fromValues(30 / 255, 128 / 255, 56 / 255, 1));
    } else {
      colors.push(vec4.fromValues(100 / 255, 50 / 255, 0, 1.0));
    }
  }.bind(this), "FX",
    controls.angle,
    controls.disableChance,
    controls.moveJitter,
    controls.rotateVariance);
  
  let baseBranch = "[DF[DX]+F[DX]--F[DX]]";
  let base = `[[Q+++${baseBranch}],` +
    `[Q+++&&${baseBranch}],` +
    `[Q+++&&&&${baseBranch}],` +
    `[Q+++&&&&&&${baseBranch}],` +
    `[Q+++&&&&&&&&${baseBranch}],` +
    `[Q+++&&&&&&&&&&${baseBranch}],` +
    `[Q+++&&&&&&&&&&&&${baseBranch}],` +
    `[Q+++&&&&&&&&&&&&&&${baseBranch}]]`;

  let curlRight = "[F-[DX]F-F-[DX]F]";
  let curlLeft = "[F+[DX]F+F+[DX]F]";
  let flowering = 
    `Q[++++${curlRight}&&${curlRight}&&${curlRight}]` +
    `[+++${curlRight}&&${curlRight}&&${curlRight}]` +
    `[++${curlRight}&&${curlRight}&&${curlRight}]` +
    `[-${curlLeft}&&${curlLeft}&&${curlLeft}]` +
    `[---${curlLeft}&&${curlLeft}&&${curlLeft}]` +
    `[----${curlLeft}&&${curlLeft}&&${curlLeft}]`;

  proc.registerRule("X", "2" +
    base +
    "F" + flowering);
  proc.registerRule("F", "aaa");
  proc.registerRule("a", "bbb");
  proc.registerRule("b", "ccc");
  proc.registerRule("c", "ddd");
  proc.registerRule("s", "eee");
  proc.registerRule("Q", "J");
  proc.stepMulti(controls.iterations);
  proc.draw();

  square.setInstanceVBOs(mats, colors);

  mats = [];
  colors = [];
  let col = vec4.fromValues(1, 0, 0, 1);
  for (let dx = -50; dx < 50; dx++) {
    for (let dy = -50; dy < 50; dy++) {
      let mat = mat4.create();
      mat4.fromTranslation(mat, [dx, 0, dy]);
      mats.push(mat);
      colors.push(col);
    }
  }
  plane.setInstanceVBOs(mats, colors);
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
  gui.add(controls, 'angle');
  gui.add(controls, 'moveJitter');
  gui.add(controls, 'disableChance');
  gui.add(controls, 'iterations');
  gui.add(controls, 'rotateVariance');
  gui.add(controls, 'Regenerate');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const gl:WebGL2RenderingContext = <WebGL2RenderingContext> canvas.getContext('webgl2');
  //const c2d = <CanvasRenderingContext2D> canvas.getContext("2d");
  if (!gl) {
    alert('WebGL 2 not supported!');
  }

  // return;
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, -10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.blendEquation(gl.FUNC_ADD);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const bg = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/bg-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/bg-frag.glsl')),
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
    gl.enable(gl.DEPTH_TEST);
    renderer.render(camera, instancedShader, [
      square,
    ]);
    renderer.render(camera, bg, [ plane ]);
    gl.disable(gl.DEPTH_TEST);
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
