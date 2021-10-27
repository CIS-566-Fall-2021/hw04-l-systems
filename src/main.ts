import {vec3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import LSystemProcessor from './lsystem/lsystemprocessor'
import Camera from './Camera';
import {gl, setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Mesh from './geometry/Mesh';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
};

let square: Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;

function loadScene() {
  square = new Mesh('', vec3.fromValues(0,0,0)); //new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  let mats: Array<mat4> = [];
  let types: Array<string> = [];
  let proc = new LSystemProcessor(function(matTrans: mat4, type: string) {
    mats.push(matTrans);
    types.push(type);
  }.bind(this), "1X");
  
  let base = "[+++[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]&[FX+FX--FX]]";
  let flowering = 
    "[++++[XF-XF-XF-XF]&&[XF-XF-XF-XF]&&[XF-XF-XF-XF]]" +
    "[+++[XF-XF-XF-XF]&&[XF-XF-XF-XF]&&[XF-XF-XF-XF]]" +
    "[++[XF-XF-XF-XF]&&[XF-XF-XF-XF]&&[XF-XF-XF-XF]]" +
    "[-[XF+XF+XF+XF]&&[XF+XF+XF+XF]&&[XF+XF+XF+XF]]" +
    "[---[XF+XF+XF+XF]&&[XF+XF+XF+XF]&&[XF+XF+XF+XF]]" +
    "[----[XF+XF+XF+XF]&&[XF+XF+XF+XF]&&[XF+XF+XF+XF]]";

  proc.registerRule("X", "FFF2" +
    base +
    "1F2" + flowering);
  proc.registerRule("F", "1GYFX1FX1G");
  proc.registerRule("Y", "1HHHHY")
  proc.registerRule("H", "[1+G-G-G+G]");
  proc.stepMulti(2);
  proc.draw();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let trans1Array:Array<number> = [];
  let trans2Array:Array<number>  = [];
  let trans3Array:Array<number>  = [];
  let trans4Array:Array<number>  = [];

  let colorsArray = [];
  let n: number = 20.0;
  for (let i = 0; i < mats.length; i++) {
    let trans = mats[i];
    let type = types[i];
    trans1Array.push(trans[0]);
    trans1Array.push(trans[1]);
    trans1Array.push(trans[2]);
    trans1Array.push(trans[3]);

    trans2Array.push(trans[4]);
    trans2Array.push(trans[5]);
    trans2Array.push(trans[6]);
    trans2Array.push(trans[7]);

    trans3Array.push(trans[8]);
    trans3Array.push(trans[9]);
    trans3Array.push(trans[10]);
    trans3Array.push(trans[11]);

    trans4Array.push(trans[12]);
    trans4Array.push(trans[13]);
    trans4Array.push(trans[14]);
    trans4Array.push(trans[15]);

    if (type === "leaf") {
      colorsArray.push(0);
      colorsArray.push(1.0);
      colorsArray.push(0);
      colorsArray.push(1.0);
    } else {
      colorsArray.push(1);
      colorsArray.push(0);
      colorsArray.push(0);
      colorsArray.push(1.0);
    }
  }

  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(
    new Float32Array(trans1Array),
    new Float32Array(trans2Array),
    new Float32Array(trans3Array),
    new Float32Array(trans4Array),
    colors);
  square.setNumInstances(mats.length); // grid of "particles"
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
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const gl:WebGL2RenderingContext = <WebGL2RenderingContext> canvas.getContext('webgl2');
  //const c2d = <CanvasRenderingContext2D> canvas.getContext("2d");
  if (!gl) {
    alert('WebGL 2 not supported!');
  }

  // c2d.beginPath(); 
  // c2d.moveTo(300, 300);
  // c2d.lineTo(400, 400);
  // c2d.stroke();

  // return;
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, -50), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

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
    //renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      square,
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
