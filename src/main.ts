import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Turtle from './LSystem/Turtle';
import LSystem from './LSystem/LSystem';
import Mesh from './geometry/Mesh';
//import {readTextFile} from './globals';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.

//https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
function readTextFile(file: string) : string
{
  var text = "";
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function ()
  {
    if(rawFile.readyState === 4)
    {
      if(rawFile.status === 200 || rawFile.status == 0)
      {
        var txt = rawFile.responseText;
        text = txt;
      }
    }
  }
  rawFile.send(null);
  return text;
}

const controls = {
  angle: 15,
  randomness: 0.,
  iterations: 4
};

let square: Mesh;
let leaf: Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let lsys: LSystem;

let prev_angle: number = 15;
let prev_randomness: number = 0.;
let prev_iterations: number = 4.;

function buildScene() {
  lsys = new LSystem(controls.randomness, controls.iterations, controls.angle );
  console.log(lsys.fullstring);
  let tup: [vec3[], vec4[], number[], boolean[]] = lsys.buildInstances()
  let off: vec3[] = tup[0];
  let rot: vec4[] = tup[1];
  let sca: number[] = tup[2];
  let type: boolean[] = tup[3]; 

  //Creating meshes
  let obj: string = readTextFile('./src/cyl.obj'); 
  let obj2: string = readTextFile('./src/leaf.obj'); 
  //console.log(obj);
  square = new Mesh(obj, vec3.fromValues(0, 0, 0));
  square.create();
  leaf = new Mesh(obj2, vec3.fromValues(0, 0, 0));
  leaf.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray_branch = [];
  let colorsArray_branch = [];
  let rotationsArray_branch = [];
  let scaleArray_branch = [];

  let offsetsArray_leaf = [];
  let colorsArray_leaf = [];
  let rotationsArray_leaf = [];
  let scaleArray_leaf = [];

  let n: number = off.length;
  let leaf_count = 0;
  //console.log(off);
  for(let i = 0; i < n; i++) {
    let vecPos: vec3 = off[i];
    let vecRot: vec4 = rot[i];
    if (type[i]) {  
      offsetsArray_branch.push(vecPos[0]);
      offsetsArray_branch.push(vecPos[1]);
      offsetsArray_branch.push(vecPos[2]);

      colorsArray_branch.push(61/255);
      colorsArray_branch.push(54/255);
      colorsArray_branch.push(53/255);
      colorsArray_branch.push(1.0); // Alpha channel

      rotationsArray_branch.push(vecRot[0]);
      rotationsArray_branch.push(vecRot[1]);
      rotationsArray_branch.push(vecRot[2]);
      rotationsArray_branch.push(vecRot[3]); 

      scaleArray_branch.push(sca[i]);
      scaleArray_branch.push(1.2);
      scaleArray_branch.push(sca[i]);
    } else {
      offsetsArray_leaf.push(vecPos[0]);
      offsetsArray_leaf.push(vecPos[1]);
      offsetsArray_leaf.push(vecPos[2]);

      colorsArray_leaf.push(.9);
      colorsArray_leaf.push(.69);
      colorsArray_leaf.push(.69);
      colorsArray_leaf.push(1.0); // Alpha channel

      rotationsArray_leaf.push(vecRot[0]);
      rotationsArray_leaf.push(vecRot[1]);
      rotationsArray_leaf.push(vecRot[2]);
      rotationsArray_leaf.push(vecRot[3]); 

      scaleArray_leaf.push(3.);
      scaleArray_leaf.push(3.);
      scaleArray_leaf.push(3.);
      leaf_count++;
    }
  }
  let offsets_branch: Float32Array = new Float32Array(offsetsArray_branch);
  let colors_branch: Float32Array = new Float32Array(colorsArray_branch);
  let rotations_branch: Float32Array = new Float32Array(rotationsArray_branch);
  let scales_branch: Float32Array = new Float32Array(scaleArray_branch);
  square.setInstanceVBOs(offsets_branch, colors_branch, rotations_branch, scales_branch);
  square.setNumInstances(n - leaf_count); // grid of "particles"
  //console.log(offsets);

  let offsets_leaf: Float32Array = new Float32Array(offsetsArray_leaf);
  let colors_leaf: Float32Array = new Float32Array(colorsArray_leaf);
  let rotations_leaf: Float32Array = new Float32Array(rotationsArray_leaf);
  let scales_leaf: Float32Array = new Float32Array(scaleArray_leaf);
  leaf.setInstanceVBOs(offsets_leaf, colors_leaf, rotations_leaf, scales_leaf);
  leaf.setNumInstances(leaf_count);
}

function loadScene() {
  screenQuad = new ScreenQuad();
  screenQuad.create();
  buildScene();
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
  gui.add(controls, 'angle', 0, 90).step(5);
  gui.add(controls, 'randomness', 0., 1.).step(.05);
  gui.add(controls, 'iterations', 0., 6.).step(1);

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

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

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

    if (controls.angle != prev_angle ||
        controls.randomness != prev_randomness ||
        controls.iterations != prev_iterations) {
          buildScene();
    }

    prev_angle = controls.angle;
    prev_randomness = controls.randomness;
    prev_iterations = controls.iterations;

    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      square, 
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
