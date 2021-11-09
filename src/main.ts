import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Turtle from './Turtle';
import LSystem, { ExpansionRule } from './LSytem';
import { Stream } from 'stream';
import Mesh from './geometry/Mesh';
import Random from './Random';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  iterations: 5,
  angle: 30,
  distance: 1,
};

let prev_iterations = 5;
let prev_angle = 30;
let prev_distance = 1;
let first_pass = true;

// let square: Square;
let square: Mesh;
let leaf: Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;

function loadScene() {
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // square = new Square();
  // let s = readTextFile('./sr/c/cylinder.obj');
  let s = readTextFile('./src/cyl.obj');
  let sL = readTextFile('./src/leaf.obj');
  // console.log("cylinder", s);
  square = new Mesh(s, vec3.fromValues(0, 0, 0));
  square.create();
  leaf = new Mesh(sL, vec3.fromValues(0, 0, 0));
  leaf.create();

  // let axiom = "FX";
  let axiom = "X";
  let iter = controls.iterations;
  // let iter = 2;
  let angle = controls.angle;
  let dist = controls.distance / 1.75;
  let seed = "apple";
  let lsystem = new LSystem(axiom, iter, angle, dist, seed);

  let grammar: Map<string, ExpansionRule> = new Map([
    ["F", new ExpansionRule(new Map([
      [0.1, "F[-X+X)]^^^^^X"],
      [0.7, "F[^X&Z]&&&&&X"],
      [0.2, "F[(X(XZ]---&&&)))Z"],
    ]))],
    ["X", new ExpansionRule(new Map([
      [0.1, "F[+XZ++X-[+ZX][-X++-XL]]"],
      [0.5, "F[&XZ&&X^[&ZX][^X&&^XL]]"],
      [0.4, "F[(XZ((X)[(ZX][)X(()XL]]"],
    ]))],
    ["Z", new ExpansionRule(new Map([
      [0.4, "[+F-X-F][++XZL]"],
      [0.1, "[&F^X^F][&&XZL]"],
      [0.5, "[(F)X(F][((XZL]"],
    ]))],
  ]);
  // let grammar: Map<string, ExpansionRule> = new Map([
    // ["X", new ExpansionRule(new Map([
      // [1.0, "X-X"],
    // ]))],
    // ["X", new ExpansionRule(new Map([
    //   [1.0, "FF[+XZ++X-F[+ZX]][-X++F-X]"],
    // ]))],
    // ["Z", new ExpansionRule(new Map([
    //   [1.0, "[+F-X-F][++ZX]"],
    // ]))],
  // ]);
  lsystem.setGrammarRules(grammar);

  let expanded = lsystem.expand(axiom);
  // console.log("expande5d sentence", expanded);
  let instanceDat = lsystem.instanceData(expanded);
  let off: Array<vec3> = instanceDat.offsets;
  let rot: Array<vec4> = instanceDat.rotations;
  let sca: Array<number> = instanceDat.scales;
  let isLeaf: Array<boolean> = instanceDat.leaf;
  let barkCol: vec3 = vec3.fromValues(116/255, 116/255, 111/255);
  // let type: Array<boolean> = instanceDat[3]; 

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray: Array<number> = [];
  let rotationArray: Array<number> = [];
  let scaleArray: Array<number> = [];
  // let type: Array<boolean> = []
  let colorsArray: Array<number> = [];

  let offsetsLeaf = [];
  let colorsLeaf = [];
  let rotationsLeaf = [];
  let scaleLeaf = [];

  let n: number = off.length;
  for(let i = 0; i < n; i++) {
    // for (let j = 0; j < n; j++) {
      if (!isLeaf[i]){
        offsetsArray.push(off[i][0]);
        offsetsArray.push(off[i][1]);
        offsetsArray.push(off[i][2]);
        
        colorsArray.push(barkCol[0]);
        colorsArray.push(barkCol[1]);
        colorsArray.push(barkCol[2]);
        colorsArray.push(1.0); // Alpha channel
        
        rotationArray.push(rot[i][0]);
        rotationArray.push(rot[i][1]);
        rotationArray.push(rot[i][2]);
        rotationArray.push(rot[i][3]);
  
        scaleArray.push(sca[i])
        scaleArray.push(1.2)
        scaleArray.push(sca[i])
      } else {
        offsetsArray.push(off[i][0]);
        offsetsArray.push(off[i][1]);
        offsetsArray.push(off[i][2]);
        
        colorsArray.push(barkCol[0]);
        colorsArray.push(barkCol[1]);
        colorsArray.push(barkCol[2]);
        colorsArray.push(1.0); // Alpha channel
        
        rotationArray.push(rot[i][0]);
        rotationArray.push(rot[i][1]);
        rotationArray.push(rot[i][2]);
        rotationArray.push(rot[i][3]);
  
        scaleArray.push(sca[i])
        scaleArray.push(1.2)
        scaleArray.push(sca[i])
      }
    // }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let rotations: Float32Array = new Float32Array(rotationArray);
  let scales: Float32Array = new Float32Array(scaleArray);
  square.setInstanceVBOs(offsets, colors, rotations, scales);
  square.setNumInstances(n); // grid of "particles"

  let offsets2: Float32Array = new Float32Array(offsetsArray);
  let colors2: Float32Array = new Float32Array(colorsArray);
  let rotations2: Float32Array = new Float32Array(rotationArray);
  let scales2: Float32Array = new Float32Array(scaleArray);
  leaf.setInstanceVBOs(offsets2, colors2, rotations2, scales2);
  leaf.setNumInstances(n); // grid of "particles"
  // console.log("offsets", offsets);
  // console.log("rotations", rotations);
  // console.log("scales", scales);
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
  gui.add(controls, "iterations", 1, 15).step(1);
  gui.add(controls, "angle", 15, 45);
  gui.add(controls, "distance", 0.1, 1).step(0.1);


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

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 5, 0));

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

    if (controls.iterations != prev_iterations || controls.angle != prev_angle || controls.distance != prev_distance) {
      loadScene();
    }

    prev_iterations = controls.iterations;
    prev_angle = controls.angle;
    prev_distance = controls.distance;

    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      square,
      leaf,
    ]);
    stats.end();

  if (first_pass) {
    // loadScene();
    first_pass = false;
  }

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
  // let iter = 2;
  // let angle = 30;
  // let dist = 2;
  // let lsystem = new LSystem("FX", iter, angle, dist, "apple");
  // console.log("expand", lsystem.expand(lsystem.axiom));
  // console.log("sentence", lsystem.cachedSentence);
  // let seed = Random.xmur3("apple");
  // let rand = Random.sfc32(seed(), seed(), seed(), seed());
  // for (let i = 0; i < 2; i++) {
    // let rand = randomizer.rand();
    // console.log(rand())
  // }
}

main();
