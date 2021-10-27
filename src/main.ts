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
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                return rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return ":(";
}

const controls = {
};

let square: Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let lsys: LSystem;

function loadScene() {
  lsys = new LSystem();
  console.log(lsys.fullstring);
  let tup: [vec3[], vec4[]] = lsys.buildInstances()
  let off: vec3[] = tup[0];
  let rot: vec4[] = tup[1];
  let obj: string = readTextFile('./src/globals.ts'); 
  console.log(obj);
  square = new Mesh(obj, vec3.fromValues(0, 0, 0));
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray = [];
  let colorsArray = [];
  let rotationsArray = [];

  let n: number = 1.0;
  for(let i = 0; i < n; i++) {
    //for(let j = 0; j < n; j++) {
      offsetsArray.push(0);
      offsetsArray.push(0);
      offsetsArray.push(0);

      colorsArray.push(.23785);
      colorsArray.push(.69);
      colorsArray.push(1.0);
      colorsArray.push(1.0); // Alpha channel

      rotationsArray.push(.0);
      rotationsArray.push(.0);
      rotationsArray.push(.0);
      rotationsArray.push(.0); // Alpha channel
    //}
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let rotations: Float32Array = new Float32Array(rotationsArray);
  square.setInstanceVBOs(offsets, colors, rotations);
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

  const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));

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
    renderer.render(camera, flat, [screenQuad]);
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
