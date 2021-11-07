import { vec3, mat4 } from "gl-matrix";
import * as Stats from "stats-js";
import * as DAT from "dat-gui";
import Square from "./geometry/Square";
import ScreenQuad from "./geometry/ScreenQuad";
import OpenGLRenderer from "./rendering/gl/OpenGLRenderer";
import Camera from "./Camera";
import { setGL } from "./globals";
import ShaderProgram, { Shader } from "./rendering/gl/ShaderProgram";
import Mesh from "./geometry/Mesh";
import LSystem from './l-system/L-System'
import { readTextFile } from "../src/globals";

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let branch: Mesh;
let matrix: mat4 = mat4.create();
let coral : LSystem = new LSystem();

function loadScene() {
  coral.makeTree();
// coral.leaf.create();


  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  branch = new Mesh(
    readTextFile("resources/cylinder.obj"),
    vec3.fromValues(0, 0, 0)
  );
  branch.create();

  let colorsArrayBranch = [];
  let cols1ArrayBranch = [];
  cols1ArrayBranch.push(5.0);
  cols1ArrayBranch.push(0.0);
  cols1ArrayBranch.push(0.0);
  cols1ArrayBranch.push(0.0);

  let cols2ArrayBranch = [];
  cols2ArrayBranch.push(0.0);
  cols2ArrayBranch.push(5.0);
  cols2ArrayBranch.push(0.0);
  cols2ArrayBranch.push(0.0);

  let cols3ArrayBranch = [];
  cols3ArrayBranch.push(0.0);
  cols3ArrayBranch.push(0.0);
  cols3ArrayBranch.push(5.0);
  cols3ArrayBranch.push(0.0);

  let cols4ArrayBranch = [];
  cols4ArrayBranch.push(50.0);
  cols4ArrayBranch.push(50.0);
  cols4ArrayBranch.push(0.0);
  cols4ArrayBranch.push(1.0);

  colorsArrayBranch.push(1.0);
  colorsArrayBranch.push(0.0);
  colorsArrayBranch.push(1.0);
  colorsArrayBranch.push(1.0);

  let t1: Float32Array = new Float32Array(cols1ArrayBranch);
  let t2: Float32Array = new Float32Array(cols2ArrayBranch);
  let t3: Float32Array = new Float32Array(cols3ArrayBranch);
  let t4: Float32Array = new Float32Array(cols4ArrayBranch);
  let branchColors: Float32Array = new Float32Array(colorsArrayBranch);
  //coral.leaf.setInstanceVBOs(t1, t2, t3, t4, branchColors);
  //coral.leaf.setNumInstances(1);

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray = [];
  let colorsArray = [];
  let n: number = 100.0;
  let sCol1 = [];
  let sCol2 = [];
  let sCol3 = [];
  let sCol4 = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      mat4.translate(matrix, matrix, vec3.fromValues(i, j, 0));
      //mat4.scale(matrix, matrix, vec3.fromValues(5.0, 5.0, 5.0));
      for (let k: number = 0; k < 4; k++) {
        sCol1.push(matrix[k]);
        sCol2.push(matrix[k + 4]);
        sCol3.push(matrix[k + 8]);
        sCol4.push(matrix[k + 12]);
      }

      colorsArray.push(j / i);
      colorsArray.push(j / i);
      colorsArray.push(1.0);
      colorsArray.push(1.0); // Alpha channel
      mat4.identity(matrix);
    }
  }

  let offsetsCol1: Float32Array = new Float32Array(sCol1);
  let offsetsCol2: Float32Array = new Float32Array(sCol2);
  let offsetsCol3: Float32Array = new Float32Array(sCol3);
  let offsetsCol4: Float32Array = new Float32Array(sCol4);

  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceTransformVBOs(
    offsetsCol1,
    offsetsCol2,
    offsetsCol3,
    offsetsCol4,
    colors
  );
  square.setNumInstances(n * n); // grid of "particles"
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0px";
  stats.domElement.style.top = "0px";
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement>document.getElementById("canvas");
  const gl = <WebGL2RenderingContext>canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL 2 not supported!");
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(
    vec3.fromValues(5, 5, 10),
    vec3.fromValues(50, 50, 0)
  );

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require("./shaders/instanced-vert.glsl")),
    new Shader(gl.FRAGMENT_SHADER, require("./shaders/instanced-frag.glsl")),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require("./shaders/flat-vert.glsl")),
    new Shader(gl.FRAGMENT_SHADER, require("./shaders/flat-frag.glsl")),
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
     // branch,
      coral.branch,
      coral.leaf
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener(
    "resize",
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
