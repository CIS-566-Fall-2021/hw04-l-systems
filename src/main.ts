import {vec3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL, branchStr, leafStr} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystem from './LSystem'; // for LSystem
import Mesh from './geometry/Mesh'; // for obj loading

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  Iterations: 3.5,
  Angle: 25,
  leaves_color:[255, 33, 0],
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;

let axiom: string = "FX";
let iter: number = 5;
let leaf: Mesh;
let branch: Mesh;
let angle: number = 25;

let leafColor = vec3.fromValues(255./255., 33./255., 0./255.);

function loadScene() {
  screenQuad = new ScreenQuad();
  screenQuad.create();

  //let branchobj: string = readTextFile('./src/obj/branch.obj');
  branch = new Mesh(branchStr, vec3.fromValues(0,0,0));
  branch.create();

  //let leafobj: string = readTextFile('./src/obj/Leaf.obj');
  leaf = new Mesh(leafStr, vec3.fromValues(0,0,0));
  leaf.create();

  let ls : LSystem = new LSystem(axiom, iter, angle);
  let branches: mat4[] = ls.branches;
  let leaves: mat4[] = ls.leaves;

  let col1Data : number[] = [];
  let col2Data : number[] = [];
  let col3Data : number[] = [];
  let col4Data : number[] = [];
  let colorData : number[] = [];

  for (let i: number = 0; i < branches.length; i++) {
    let curBranch: mat4 = branches[i];
    col1Data.push(curBranch[0]);
    col1Data.push(curBranch[1]);
    col1Data.push(curBranch[2]);
    col1Data.push(curBranch[3]);

    col2Data.push(curBranch[4]);
    col2Data.push(curBranch[5]);
    col2Data.push(curBranch[6]);
    col2Data.push(curBranch[7]);

    col3Data.push(curBranch[8]);
    col3Data.push(curBranch[9]);
    col3Data.push(curBranch[10]);
    col3Data.push(curBranch[11]);

    col4Data.push(curBranch[12]);
    col4Data.push(curBranch[13]);
    col4Data.push(curBranch[14]);
    col4Data.push(curBranch[15]);

    colorData.push(97.0 / 255.0);
    colorData.push(59.0 / 255.0);
    colorData.push(22.0 / 255.0);
    colorData.push(1.0);
  }

  let col1 : Float32Array = new Float32Array(col1Data);
  let col2 : Float32Array = new Float32Array(col2Data);
  let col3 : Float32Array = new Float32Array(col3Data);
  let col4 : Float32Array = new Float32Array(col4Data);
  let colors : Float32Array = new Float32Array(colorData);
  branch.setInstanceVBOs(colors, col1, col2, col3, col4);
  branch.setNumInstances(branches.length); 

  colorData = [];
  col1Data = [];
  col2Data = [];
  col3Data = [];
  col4Data = [];

  for (let i: number = 0; i < leaves.length; i++) {
    let curLeaf: mat4 = leaves[i];
    col1Data.push(curLeaf[0]);
    col1Data.push(curLeaf[1]);
    col1Data.push(curLeaf[2]);
    col1Data.push(curLeaf[3]);

    col2Data.push(curLeaf[4]);
    col2Data.push(curLeaf[5]);
    col2Data.push(curLeaf[6]);
    col2Data.push(curLeaf[7]);

    col3Data.push(curLeaf[8]);
    col3Data.push(curLeaf[9]);
    col3Data.push(curLeaf[10]);
    col3Data.push(curLeaf[11]);

    col4Data.push(curLeaf[12]);
    col4Data.push(curLeaf[13]);
    col4Data.push(curLeaf[14]);
    col4Data.push(curLeaf[15]);

    colorData.push(leafColor[0]);
    colorData.push(leafColor[1]);
    colorData.push(leafColor[2]);
    colorData.push(1.0);

  }
  colors = new Float32Array(colorData);
  col1 = new Float32Array(col1Data);
  col2 = new Float32Array(col2Data);
  col3 = new Float32Array(col3Data);
  col4 = new Float32Array(col4Data);
  leaf.setInstanceVBOs(colors, col1, col2, col3, col4);
  leaf.setNumInstances(leaves.length); 
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
  gui.add(controls, 'Iterations', 0, 5);
  gui.add(controls, 'Angle', 0, 30);
  gui.addColor(controls, 'leaves_color').onChange(setLeafColor);

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

  const camera = new Camera(vec3.fromValues(63.5,19.3,41.96), vec3.fromValues(6.127,18.17,0.68));

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

    if (iter != controls.Iterations) {
      iter = controls.Iterations;
      loadScene();
    }
    if (angle != controls.Angle) {
      angle = controls.Angle;
      loadScene();
    }

    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      branch, 
      leaf, 
      // square
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

  function setLeafColor() {
    leafColor = vec3.fromValues(controls.leaves_color[0] / 255., controls.leaves_color[1] / 255., controls.leaves_color[2] / 255.);
    loadScene();
}
}

function readTextFile(file: string): string
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
                var allText = rawFile.responseText;
                text = allText;
            }
        }
    }
    rawFile.send(null);
    return text;
}

main();
