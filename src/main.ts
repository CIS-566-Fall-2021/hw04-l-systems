import {vec2, vec3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Cylinder from './geometry/Cylinder';
import Mesh from './geometry/Mesh';
//import * as fs from 'fs';
import Foliage from './geometry/Foliage';
import InstancedData from './geometry/InstancedData';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  iterations: 4,
  'Radius': 0.75,
  'Step Size': 0.9,
  'Rotational Noise': 20,
  'Step Noise': 0.01,
  'Length Decay': 0.1,
  'Radial Decay': 2.0,
  'Angle': 20,
  'Offset': -0.01,
  'Leaf Size': 5.0,
  'Smooth Shading' : true,
  'Load Scene': loadScene,
  'Animate Camera' : true,
  'Seed' : 0
  // A function pointer, essentially
};

let square: Square;
let fallingLeaves: Square;

let cylinder: Cylinder;

let screenQuad: ScreenQuad;
let time: number = 0.0;
let l_system: Foliage;

function loadScene() {
  l_system = new Foliage();
  l_system.iterations = controls.iterations;
  l_system.radius = controls["Radius"];
  l_system.orientRand = controls["Rotational Noise"];
  l_system.decay = controls["Radial Decay"] * 0.1;
  l_system.stepDecay = controls["Length Decay"] * 0.1;
  //l_system.length_stoch = controls["Step Noise"];
  l_system.offset = controls["Offset"] * 0.1;
  l_system.curvature = controls["Angle"];
  l_system.height = controls["Step Size"];
  l_system.smoothshading = controls["Smooth Shading"];
  l_system.leaf_size = controls["Leaf Size"]
  l_system.setSeed(controls["Seed"])

  l_system.refreshSystem();

  square = new Square();
  square.uv_cell = 3;
  square.create();

  cylinder = new Cylinder();
  cylinder.uv_cell = 0
  cylinder.loadUnitCylinder();
  cylinder.create();

  fallingLeaves = new Square();
  fallingLeaves.uv_cell = 3;
  fallingLeaves.create();


  //console.log(cylinder.count)
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray = [];
  let colorsArray = [];
  let scaleArray = [];

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
      scaleArray.push(1.0);
      scaleArray.push(1.0);
      scaleArray.push(1.0);


    }
  }


  // for(var i = 0; i < l_system.branchInstances.length; i++)
  // {
  //   for(let j = 0; j < 4; j++) {
  //     transformXArray.push(l_system.branchInstances[i].transformColumnX[j]);
  //     transformYArray.push(l_system.branchInstances[i].transformColumnY[j]);
  //     transformZArray.push(l_system.branchInstances[i].transformColumnZ[j]);
  //     transformWArray.push(l_system.branchInstances[i].transformColumnW[j]);

  //   }
  // }

  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let scales: Float32Array = new Float32Array(scaleArray);

  let identity = mat4.create()
  let instance = new InstancedData();
  instance.addTransform(identity);

    
  let transformXArray = [];
  let transformYArray = [];
  let transformZArray = [];
  let transformWArray = [];

// Uncomment to preview a single cylinder
  //  transformXArray = [];
  //  transformYArray = [];
  //  transformZArray = [];
  //  transformWArray = [];

  // for(let j = 0; j < 4; j++) {
  //   transformXArray.push(instance.transformColumnX[j]);
  //   transformYArray.push(instance.transformColumnY[j]);
  //   transformZArray.push(instance.transformColumnZ[j]);
  //   transformWArray.push(instance.transformColumnW[j]);

  // }

  cylinder.setInstanceVBOs(l_system.branchInstances);
  cylinder.setNumInstances(l_system.branchInstances.size); // grid of "particles"

 // console.log(l_system.branchInstances)
  //console.log(l_system.branchInstances.size)

  square.setInstanceVBOs(l_system.leafInstances);
  square.setNumInstances(l_system.leafInstances.size); // grid of "particles"

 //console.log(l_system.leafInstances)

  let fallingLeavesInstance = new InstancedData();

  for (let i = 0; i < 5; ++i) {
    for (let j = 0; j < 5; ++j) {
      for (let k = 0; k < 5; ++k) {
        let offsetX = l_system.rand.random() - 0.5;
        let offsetY = l_system.rand.random() - 0.5;
        let offsetZ = l_system.rand.random() - 0.5;

      identity = mat4.create()
      mat4.translate(identity, identity, vec3.fromValues(i + offsetX, j + offsetY, k + offsetZ))
      mat4.scale(identity, identity, vec3.fromValues(2.0,2.0,2.0))
      let randTex = Math.floor(5.0 + l_system.rand.random() * 10.0);
      fallingLeavesInstance.addInstance(identity,randTex);
      }
    }
  }

  fallingLeaves.setInstanceVBOs(fallingLeavesInstance);
  fallingLeaves.setNumInstances(fallingLeavesInstance.size); // grid of "particles"

  //cylinder.setInstanceVBOs(tX, tY, tZ, tW);
 // cylinder.setNumInstances(1); // grid of "particles"

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
  //gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'iterations', 1, 5).step(1)
  gui.add(controls, 'Rotational Noise', 0, 100).step(1)
  //gui.add(controls, 'Step Noise', 0, 1).step(0.01)
  gui.add(controls, 'Radial Decay', -1, 3).step(0.01)
  gui.add(controls, 'Length Decay', -0.2, 2).step(0.01)
  gui.add(controls, 'Angle', 0, 60).step(0.01)
  gui.add(controls, 'Radius', 0.1, 2).step(0.01)
  gui.add(controls, 'Step Size', 0.2, 1.2).step(0.01)
  gui.add(controls, 'Leaf Size', 0.0, 5).step(0.01)
  gui.add(controls, 'Seed');

  //gui.add(controls, 'Offset', -10, 10).step(0.01);
 // gui.add(controls, 'Smooth Shading');
  gui.add(controls, 'Load Scene');

  //gui.add(controls, 'Export OBJ');

 // let debug = gui.addFolder("Debug");
 // debug.add(controls,'Animate Camera')

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

  const camera = new Camera(vec3.fromValues(0, 18, 43), vec3.fromValues(0, 18, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.71, 0.70, 0.62, 1);

  gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);  

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const particleShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/particles-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/particles-frag.glsl')),
  ]);

  instancedShader.setBaseColorTexture("./textures/textures.png")
  instancedShader.setNormalMapTexture("./textures/normal.png")

  particleShader.setBaseColorTexture("./textures/textures.png")
  particleShader.setNormalMapTexture("./textures/normal.png")


  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);
  
  flat.setBaseColorTexture("./textures/background.png")

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    particleShader.setTime(time);

    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      cylinder,
      square
    ]);

    renderer.render(camera, particleShader, [
      fallingLeaves
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
