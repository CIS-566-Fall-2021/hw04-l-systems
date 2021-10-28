import {vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Turtle from './Turtle';
import LSystem from './LSytem';
import { Stream } from 'stream';
import Mesh from './geometry/Mesh';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
};

// let square: Square;
let square: Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;

function loadScene() {
  // square = new Square();
  let s = readTextFile('./src/cylinder.obj');
  // let s = readTextFile('./src/cyl.obj');
  console.log("cylinder", s);
  square = new Mesh(s, vec3.fromValues(0, 0, 0));
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray = [];
  let scaleArray: Array<number> = [];
  let rotationArray: Array<number> = [];
  let colorsArray = [];
  let n: number = 5;
  for(let i = 0; i < n; i++) {
    // for (let j = 0; j < n; j++) {

      offsetsArray.push(0);
      offsetsArray.push(i);
      offsetsArray.push(0);
      
      colorsArray.push(0.70);
      colorsArray.push(0.70);
      colorsArray.push(0.0);
      colorsArray.push(1.0); // Alpha channel
      
    // }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let rotations: Float32Array = new Float32Array(rotationArray);
  let scales: Float32Array = new Float32Array(scaleArray);
  square.setInstanceVBOs(offsets, colors, rotations, scales);
  square.setNumInstances(n); // grid of "particles"
  console.log(offsets);
}

function readTextFile(file: string): string {
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

  // use mesh constructor
  // let s = readTextFile('./src/cylinder.obj');
  // console.log(s)

  // let str = "abc"
  // console.log("str", str);
  // let s = Array.from(str);
  // console.log("s", s);
  // s[0] = "xy"
  // s = Array.from(s.join(""))
  // console.log("s", s);
  // let map = new Map([
  //   ["a", "ok"]
  // ]);
  // console.log(map.has('a'));
  // console.log(map.get("a"));
  // let t = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(1, 0, 0));
  // t.logAtts();
  // for (let i = 0; i < 4; i++) {
  //   t.rotate(vec3.fromValues(0, 1, 0), 90);
  //   t.logAtts();
  // }
  let lsystem = new LSystem("FX", 2, "apple");
  console.log("expand", lsystem.expand(lsystem.axiom));
  console.log("sentence", lsystem.cachedSentence);
}

main();
