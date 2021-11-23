import {vec3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as ran from 'ranjs';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import {readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Mesh from './geometry/Mesh';
import Plant from './lsystem/Plant';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.

// Procedural Controls
let prevIterations: number;
let prevBranchThickness: number;
let prevSeed: number;
let prevAppleDensity: number;

const controls = {
  iterations: 3,
  branchThickness: 0.5,
  seed: 1.0,
  appleDensity: 0.15,
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;

let plantCylinderOBJ: string = readTextFile('https://raw.githubusercontent.com/18smlee/hw04-l-systems/master/src/geometry/plantCylinder.obj');
let plantCylinder: Mesh;

let leafOBJ: string = readTextFile('https://raw.githubusercontent.com/18smlee/hw04-l-systems/master/src/geometry/leafPlane.obj');
let leaf: Mesh;

let potOBJ: string = readTextFile('https://raw.githubusercontent.com/18smlee/hw04-l-systems/master/src/geometry/pot.obj');
let pot: Mesh;

let dirtOBJ: string = readTextFile('https://raw.githubusercontent.com/18smlee/hw04-l-systems/master/src/geometry/mulch.obj');
let dirt: Mesh;

let groundOBJ: string = readTextFile('https://raw.githubusercontent.com/18smlee/hw04-l-systems/master/src/geometry/ground.obj');
let ground: Mesh;

let appleOBJ: string = readTextFile('https://raw.githubusercontent.com/18smlee/hw04-l-systems/master/src/geometry/apple.obj');
let apple: Mesh;


function loadScene(seed:number, branchThickness: number, appleDensity: number) {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  plantCylinder = new Mesh(plantCylinderOBJ, 0, vec3.fromValues(0.0, 0.0, 0.0));
  plantCylinder.create();

  leaf = new Mesh(leafOBJ, 1, vec3.fromValues(0.0, 0.0, 0.0));
  leaf.create();

  pot = new Mesh(potOBJ, 2, vec3.fromValues(0.0, 0.0, 0.0));
  pot.create();

  ground = new Mesh(groundOBJ, 3, vec3.fromValues(0.0, 0.0, 0.0));
  ground.create();
  
  apple = new Mesh(appleOBJ, 4, vec3.fromValues(0.0, 0.0, 0.0));
  apple.create();

  dirt = new Mesh(dirtOBJ, 5, vec3.fromValues(0.0, 0.0, 0.0));
  dirt.create();

  // Create plant
  let plant = new Plant("TTTTTTTTX", controls.iterations, 30.0, seed, branchThickness, appleDensity);
  plant.create();

  // Set up instanced rendering data arrays for plant
  let num: number = plant.transformationMats.length;

  let colorsArray = [];
  let instanceIdArray = [];
  let transform1Array = [];
  let transform2Array = [];
  let transform3Array = [];
  let transform4Array = [];
  for (let i = 0; i < num; i++) {
    let T = plant.transformationMats[i];
    transform1Array.push(T[0]);
    transform1Array.push(T[1]);
    transform1Array.push(T[2]);
    transform1Array.push(T[3]);

    transform2Array.push(T[4]);
    transform2Array.push(T[5]);
    transform2Array.push(T[6]);
    transform2Array.push(T[7]);

    transform3Array.push(T[8]);
    transform3Array.push(T[9]);
    transform3Array.push(T[10]);
    transform3Array.push(T[11]);

    transform4Array.push(T[12]);
    transform4Array.push(T[13]);
    transform4Array.push(T[14]);
    transform4Array.push(1);

    instanceIdArray.push(i);
    instanceIdArray.push(i);
    instanceIdArray.push(i);
    instanceIdArray.push(i);

    colorsArray.push(114.0 / 255.0);
    colorsArray.push(69.0 / 255.0);
    colorsArray.push(12.0 / 255.0);
    colorsArray.push(1.0);
  }

  let colors: Float32Array = new Float32Array(colorsArray);
  let instanceIds: Float32Array = new Float32Array(instanceIdArray);
  let transform1: Float32Array = new Float32Array(transform1Array);
  let transform2: Float32Array = new Float32Array(transform2Array);
  let transform3: Float32Array = new Float32Array(transform3Array);
  let transform4: Float32Array = new Float32Array(transform4Array);

  plantCylinder.setInstanceVBOs(colors, instanceIds, transform1, transform2, transform3, transform4);
  plantCylinder.setNumInstances(plant.transformationMats.length);

  // Set up instanced rendering data arrays for plant's leaves
  let leafNum: number = plant.leafTransformationMats.length;

  let leafColorsArray = [];
  let leafInstanceIdArray = [];
  let leafTransform1Array = [];
  let leafTransform2Array = [];
  let leafTransform3Array = [];
  let leafTransform4Array = [];

  for (let i = 0; i < leafNum; i++) {
    let T = plant.leafTransformationMats[i];
    leafTransform1Array.push(T[0]);
    leafTransform1Array.push(T[1]);
    leafTransform1Array.push(T[2]);
    leafTransform1Array.push(T[3]);

    leafTransform2Array.push(T[4]);
    leafTransform2Array.push(T[5]);
    leafTransform2Array.push(T[6]);
    leafTransform2Array.push(T[7]);

    leafTransform3Array.push(T[8]);
    leafTransform3Array.push(T[9]);
    leafTransform3Array.push(T[10]);
    leafTransform3Array.push(T[11]);

    leafTransform4Array.push(T[12]);
    leafTransform4Array.push(T[13]);
    leafTransform4Array.push(T[14]);
    leafTransform4Array.push(1);

    leafInstanceIdArray.push(i);
    leafInstanceIdArray.push(i);
    leafInstanceIdArray.push(i);
    leafInstanceIdArray.push(i);

    leafColorsArray.push(32.0 / 255.0);
    leafColorsArray.push(132.0 / 255.0);
    leafColorsArray.push(77.0 / 255.0);
    leafColorsArray.push(1.0);
  }

  let leafColors: Float32Array = new Float32Array(leafColorsArray);
  let leafInstanceIds: Float32Array = new Float32Array(leafInstanceIdArray);
  let leafTransform1: Float32Array = new Float32Array(leafTransform1Array);
  let leafTransform2: Float32Array = new Float32Array(leafTransform2Array);
  let leafTransform3: Float32Array = new Float32Array(leafTransform3Array);
  let leafTransform4: Float32Array = new Float32Array(leafTransform4Array);

  leaf.setInstanceVBOs(leafColors, leafInstanceIds, leafTransform1, leafTransform2, leafTransform3, leafTransform4);
  leaf.setNumInstances(plant.leafTransformationMats.length);

  // Set up instanced rendering data arrays for apple
  let appleNum: number = plant.appleTransformationMats.length;

  let appleColorsArray = [];
  let appleInstanceIdArray = [];
  let appleTransform1Array = [];
  let appleTransform2Array = [];
  let appleTransform3Array = [];
  let appleTransform4Array = [];
  for (let i = 0; i < appleNum; i++) {
    let T = plant.appleTransformationMats[i];
    appleTransform1Array.push(T[0]);
    appleTransform1Array.push(T[1]);
    appleTransform1Array.push(T[2]);
    appleTransform1Array.push(T[3]);

    appleTransform2Array.push(T[4]);
    appleTransform2Array.push(T[5]);
    appleTransform2Array.push(T[6]);
    appleTransform2Array.push(T[7]);

    appleTransform3Array.push(T[8]);
    appleTransform3Array.push(T[9]);
    appleTransform3Array.push(T[10]);
    appleTransform3Array.push(T[11]);

    appleTransform4Array.push(T[12]);
    appleTransform4Array.push(T[13]);
    appleTransform4Array.push(T[14]);
    appleTransform4Array.push(1);

    appleInstanceIdArray.push(i);
    appleInstanceIdArray.push(i);
    appleInstanceIdArray.push(i);
    appleInstanceIdArray.push(i);

    appleColorsArray.push(185.0/255.0);
    appleColorsArray.push(25.0/255.0);
    appleColorsArray.push(7.0/255.0);
    appleColorsArray.push(1.0);
  }

  let appleColors: Float32Array = new Float32Array(appleColorsArray);
  let appleInstanceIds: Float32Array = new Float32Array(appleInstanceIdArray);
  let appleTransform1: Float32Array = new Float32Array(appleTransform1Array);
  let appleTransform2: Float32Array = new Float32Array(appleTransform2Array);
  let appleTransform3: Float32Array = new Float32Array(appleTransform3Array);
  let appleTransform4: Float32Array = new Float32Array(appleTransform4Array);

  apple.setInstanceVBOs(appleColors, appleInstanceIds, appleTransform1, appleTransform2, appleTransform3, appleTransform4);
  apple.setNumInstances(appleNum);

  // Set up instanced rendering data arrays for pot
  let potNum: number = 1;

  let potColorsArray = [];
  let potInstanceIdArray = [];
  let potTransform1Array = [];
  let potTransform2Array = [];
  let potTransform3Array = [];
  let potTransform4Array = [];
  for (let i = 0; i < potNum; i++) {
    let T = mat4.create();
    mat4.identity(T);
    potTransform1Array.push(T[0]);
    potTransform1Array.push(T[1]);
    potTransform1Array.push(T[2]);
    potTransform1Array.push(T[3]);

    potTransform2Array.push(T[4]);
    potTransform2Array.push(T[5]);
    potTransform2Array.push(T[6]);
    potTransform2Array.push(T[7]);

    potTransform3Array.push(T[8]);
    potTransform3Array.push(T[9]);
    potTransform3Array.push(T[10]);
    potTransform3Array.push(T[11]);

    potTransform4Array.push(T[12]);
    potTransform4Array.push(T[13]);
    potTransform4Array.push(T[14]);
    potTransform4Array.push(1);
    
    potInstanceIdArray.push(i);
    potInstanceIdArray.push(i);
    potInstanceIdArray.push(i);
    potInstanceIdArray.push(i);

    potColorsArray.push(161.0/255.0);
    potColorsArray.push(71.0/255.0);
    potColorsArray.push(39.0/255.0);
    potColorsArray.push(1.0);
  }

  let potColors: Float32Array = new Float32Array(potColorsArray);
  let potInstanceId: Float32Array = new Float32Array(potInstanceIdArray);
  let potTransform1: Float32Array = new Float32Array(potTransform1Array);
  let potTransform2: Float32Array = new Float32Array(potTransform2Array);
  let potTransform3: Float32Array = new Float32Array(potTransform3Array);
  let potTransform4: Float32Array = new Float32Array(potTransform4Array);

  pot.setInstanceVBOs(potColors, potInstanceId, potTransform1, potTransform2, potTransform3, potTransform4);
  pot.setNumInstances(potNum);

  // Set up instanced rendering data arrays for dirt
  let dirtNum: number = 1;

  let dirtColorsArray = [];
  let dirtInstanceIdArray = [];
  let dirtTransform1Array = [];
  let dirtTransform2Array = [];
  let dirtTransform3Array = [];
  let dirtTransform4Array = [];
  for (let i = 0; i < potNum; i++) {
    let T = mat4.create();
    mat4.identity(T);
    dirtTransform1Array.push(T[0]);
    dirtTransform1Array.push(T[1]);
    dirtTransform1Array.push(T[2]);
    dirtTransform1Array.push(T[3]);

    dirtTransform2Array.push(T[4]);
    dirtTransform2Array.push(T[5]);
    dirtTransform2Array.push(T[6]);
    dirtTransform2Array.push(T[7]);

    dirtTransform3Array.push(T[8]);
    dirtTransform3Array.push(T[9]);
    dirtTransform3Array.push(T[10]);
    dirtTransform3Array.push(T[11]);

    dirtTransform4Array.push(T[12]);
    dirtTransform4Array.push(T[13]);
    dirtTransform4Array.push(T[14]);
    dirtTransform4Array.push(1);

    dirtInstanceIdArray.push(i);
    dirtInstanceIdArray.push(i);
    dirtInstanceIdArray.push(i);
    dirtInstanceIdArray.push(i);

    dirtColorsArray.push(33.0/255.0);
    dirtColorsArray.push(13.0/255.0);
    dirtColorsArray.push(2.0/255.0);
    dirtColorsArray.push(1.0);
  }

  let dirtColors: Float32Array = new Float32Array(dirtColorsArray);
  let dirtInstanceIds: Float32Array = new Float32Array(dirtInstanceIdArray);
  let dirtTransform1: Float32Array = new Float32Array(dirtTransform1Array);
  let dirtTransform2: Float32Array = new Float32Array(dirtTransform2Array);
  let dirtTransform3: Float32Array = new Float32Array(dirtTransform3Array);
  let dirtTransform4: Float32Array = new Float32Array(dirtTransform4Array);

  dirt.setInstanceVBOs(dirtColors, dirtInstanceIds, dirtTransform1, dirtTransform2, dirtTransform3, dirtTransform4);
  dirt.setNumInstances(dirtNum);

  // Set up instanced rendering data arrays for ground
  let groundNum: number = 1;

  let groundColorsArray = [];
  let groundInstanceIdArray = [];
  let groundTransform1Array = [];
  let groundTransform2Array = [];
  let groundTransform3Array = [];
  let groundTransform4Array = [];
  for (let i = 0; i < potNum; i++) {
    let T = mat4.create();
    mat4.identity(T);
    groundTransform1Array.push(T[0]);
    groundTransform1Array.push(T[1]);
    groundTransform1Array.push(T[2]);
    groundTransform1Array.push(T[3]);

    groundTransform2Array.push(T[4]);
    groundTransform2Array.push(T[5]);
    groundTransform2Array.push(T[6]);
    groundTransform2Array.push(T[7]);

    groundTransform3Array.push(T[8]);
    groundTransform3Array.push(T[9]);
    groundTransform3Array.push(T[10]);
    groundTransform3Array.push(T[11]);

    groundTransform4Array.push(T[12]);
    groundTransform4Array.push(T[13]);
    groundTransform4Array.push(T[14]);
    groundTransform4Array.push(1);

    groundInstanceIdArray.push(i);
    groundInstanceIdArray.push(i);
    groundInstanceIdArray.push(i);
    groundInstanceIdArray.push(i);

    groundColorsArray.push(230.0/255.0);
    groundColorsArray.push(172.0/255.0);
    groundColorsArray.push(95.0/255.0);
    groundColorsArray.push(1.0);
  }

  let groundColors: Float32Array = new Float32Array(groundColorsArray);
  let groundInstanceIds: Float32Array = new Float32Array(groundInstanceIdArray);
  let groundTransform1: Float32Array = new Float32Array(groundTransform1Array);
  let groundTransform2: Float32Array = new Float32Array(groundTransform2Array);
  let groundTransform3: Float32Array = new Float32Array(groundTransform3Array);
  let groundTransform4: Float32Array = new Float32Array(groundTransform4Array);

  ground.setInstanceVBOs(groundColors, groundInstanceIds, groundTransform1, groundTransform2, groundTransform3, groundTransform4);
  ground.setNumInstances(groundNum);
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
  
  gui.add(controls, 'iterations', 1, 6).step(1.0);
  gui.add(controls, 'branchThickness', 0.3, 0.8).step(0.02);
  gui.add(controls, 'seed', 1.0, 10.0).step(1.0);
  gui.add(controls, 'appleDensity', 0.0, 0.25).step(0.01);


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
  loadScene(controls.seed, controls.branchThickness, controls.appleDensity);

  const camera = new Camera(vec3.fromValues(0, 10, 30), vec3.fromValues(0, 5, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.1, 0.1, 0.1, 1);
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);
  
  instancedShader.setTextures();

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

    if (controls.iterations != prevIterations || controls.branchThickness != prevBranchThickness || 
        controls.seed != prevSeed || controls.appleDensity != prevAppleDensity) {
      loadScene(controls.seed, controls.branchThickness, controls.appleDensity);
      prevIterations = controls.iterations;
      prevBranchThickness = controls.branchThickness;
      prevSeed = controls.seed;
      prevAppleDensity = controls.appleDensity;
    }

    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      plantCylinder,
      leaf,
      // pot,
      ground,
      dirt,
      apple,
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
