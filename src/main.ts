import {vec3, vec4} from 'gl-matrix';
import {mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Mesh from './geometry/Mesh';
import LSystem from './LSystem';
// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  iteration: 8,
  'Reload': reload, // A function pointer, essentially
  leafScale: 0.5,
};
var palette = {
  leaf: [255, 94, 0], // RGB array
};

let r: number = 255;
let g: number = 94;
let leafScale = 0.5;
let b: number = 0;
let prevIteratoin: number = 8;
let square: Square;
let branch: Mesh;
let turn: Mesh;
let leaf: Mesh;
let bat: Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let ls: LSystem = new LSystem("X", controls.iteration, vec3.fromValues(r / 255, g / 255, b / 255), leafScale);

function reload() {
  ls = new LSystem("X", controls.iteration, vec3.fromValues(r / 255, g / 255, b / 255), leafScale);
}

function readOBJ(file: string): string {
  var text = "";
  var rf = new XMLHttpRequest();
  rf.open("GET", file, false);
  rf.onreadystatechange = function () {
      if (rf.readyState === 4) {
          if (rf.status === 200 || rf.status == 0) {
              var allText = rf.responseText;
              text = allText;
          }
      }
  }
  rf.send(null);
  return text;
}

function loadScene() {

  var objstr1 = readOBJ('https://raw.githubusercontent.com/effieyanfei/hw04-l-systems/master/src/cube.obj');
  var objstr2 = readOBJ('https://raw.githubusercontent.com/effieyanfei/hw04-l-systems/master/src/sphere.obj');
  var objstr3 = readOBJ('https://raw.githubusercontent.com/effieyanfei/hw04-l-systems/master/src/bat.obj');
  var objstr4 = readOBJ('https://raw.githubusercontent.com/effieyanfei/hw04-l-systems/master/src/leaf.obj');

  branch = new Mesh(objstr1, vec3.fromValues(0.0, 0.0, 0.0));
  branch.create();

  turn = new Mesh(objstr2, vec3.fromValues(0.0, 0.0, 0.0));
  turn.create();

  leaf = new Mesh(objstr4, vec3.fromValues(0.0, 0.0, 0.0));
  leaf.create();

  bat = new Mesh(objstr3, vec3.fromValues(0.0, 0.0, 0.0));
  bat.create();

  screenQuad = new ScreenQuad();
  screenQuad.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  branch.setInstanceVBOs(ls.getTFloat32Array(ls.Btransformations, 1),
  ls.getTFloat32Array(ls.Btransformations, 2),
  ls.getTFloat32Array(ls.Btransformations, 3),
  ls.getTFloat32Array(ls.Btransformations, 4),
  ls.getCFloat32Array(ls.Bcolors));
  branch.setNumInstances(ls.Btransformations.length); // grid of "particles"

  turn.setInstanceVBOs(ls.getTFloat32Array(ls.Ttransformations, 1),
  ls.getTFloat32Array(ls.Ttransformations, 2),
  ls.getTFloat32Array(ls.Ttransformations, 3),
  ls.getTFloat32Array(ls.Ttransformations, 4),
  ls.getCFloat32Array(ls.Tcolors));
  turn.setNumInstances(ls.Ttransformations.length);

  leaf.setInstanceVBOs(ls.getTFloat32Array(ls.Ltransformations, 1),
  ls.getTFloat32Array(ls.Ltransformations, 2),
  ls.getTFloat32Array(ls.Ltransformations, 3),
  ls.getTFloat32Array(ls.Ltransformations, 4),
  ls.getCFloat32Array(ls.Lcolors));
  leaf.setNumInstances(ls.Ltransformations.length);

  bat.setInstanceVBOs(ls.getTFloat32Array(ls.Htransformations, 1),
  ls.getTFloat32Array(ls.Htransformations, 2),
  ls.getTFloat32Array(ls.Htransformations, 3),
  ls.getTFloat32Array(ls.Htransformations, 4),
  ls.getCFloat32Array(ls.Hcolors));
  bat.setNumInstances(ls.Htransformations.length);

}

function loadSquare() {
  square = new Square();
  square.create();
  let offsetsArray = [];
  let colorsArray = [];
  let n: number = 100.0;
  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {
      offsetsArray.push(i);
      offsetsArray.push(j);
      offsetsArray.push(0);

      colorsArray.push(i / n);
      colorsArray.push(j / n);
      colorsArray.push(1.0);
      colorsArray.push(1.0); // Alpha channel
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(n * n); // grid of "particles"
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
  gui.add(controls, 'iteration', 8, 12).step(1);
  gui.add(controls, 'leafScale', 0.1, 1.0).step(0.1);
  var colorController = gui.addColor(palette, 'leaf');

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
  loadSquare();

  const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
 // gl.enable(gl.BLEND);
 //  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

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
    var newColor = colorController.getValue();
    if(newColor[0] != r || newColor[1] != g || newColor[2] != b) {
      r = newColor[0];
      g = newColor[1];
      b = newColor[2];
      ls = new LSystem("X", prevIteratoin, vec3.fromValues(r / 255, g / 255, b / 255), leafScale);
      loadScene();
    }

    if(controls.iteration != prevIteratoin)
    {
      prevIteratoin = controls.iteration;
      ls = new LSystem("X", prevIteratoin, vec3.fromValues(r / 255, g / 255, b / 255), leafScale);
      loadScene();
    }

    if(controls.leafScale != leafScale)
    {
      leafScale = controls.leafScale;
      ls = new LSystem("X", prevIteratoin, vec3.fromValues(r / 255, g / 255, b / 255), leafScale);
      loadScene();
    }
    
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      square,
      branch,
      turn,
      leaf,
      bat,
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