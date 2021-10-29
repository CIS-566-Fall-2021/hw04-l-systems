import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'Stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {gl, setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import expansionRule from './geometry/expansionRule';
import drawingRule from './geometry/drawingRule';
import Mesh from './geometry/Mesh';
//import objString from './geometry/cylinderTest';
import objString from './geometry/cylinderTest2';
import branchString  from './geometry/branch';
import leafString from './geometry/leafString';
import { FORMERR } from 'dns';
// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Load Scene': loadScene,
  'iterations': 3,
  'AngleMin': 15,
  'AngleMax': 40,
  'LeafAmount': 5,
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let cylinder: Mesh;
let leaves: Mesh;
function loadScene() {
  square = new Square();
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
  let branchCol = [];
  let leaveCol = [];
  let n: number = 100.0;


  
  //let axiom = "F";
  //let rule = new expansionRule(axiom, 1);
  //rule.fillMap();
  //let final = rule.parseGrammar();
  let drawing = new drawingRule(controls.iterations, controls.AngleMin, controls.AngleMax, controls.LeafAmount);
  drawing.setString();
  drawing.setMap();
  drawing.draw();
  cylinder = new Mesh(branchString, vec3.fromValues(0, 0, 0)); 
  cylinder.create();
  
  
  leaves = new Mesh(leafString, vec3.fromValues(0, 0, 0));
  leaves.create();
  
  let transform1: Float32Array = new Float32Array(drawing.col1);
  let transform2: Float32Array = new Float32Array(drawing.col2);
  let transform3: Float32Array = new Float32Array(drawing.col3);
  
   
  let tr1: Float32Array = new Float32Array(drawing.leaf1);
  let tr2: Float32Array = new Float32Array(drawing.leaf2);
  let tr3: Float32Array = new Float32Array(drawing.leaf3);
  let tr4: Float32Array = new Float32Array(drawing.leaf4);
  let t1 = [];
  t1.push(0);
  t1.push(0);
  t1.push(1);
  t1.push(1);
  t1.push(0);
  t1.push(5);
  t1.push(1);
  t1.push(1);
  let transform4: Float32Array = new Float32Array(drawing.col4);
  //console.log(transform3);
  //console.log(transform4);
  //leafCol
  let leafCol1 = [.996, .792, .219, 1];
  let leafCol2 = [.996, .929, .505, 1.0];
  let leafCol3 = [.964, .419, .219, 1];
  let leafArray = [];
  leafArray.push(leafCol1);
  leafArray.push(leafCol2);
  leafArray.push(leafCol3);
  for(let i = 0; i < (tr1.length / 4.0); i++)
  {
    for(let j = 0; j < (tr1.length / 4.0); j++)
    {
      let r = Math.random() * (2 - 0) + 0;
      if(r > 0 && r < 1){
        leaveCol.push(.996);
        leaveCol.push(.792);
        leaveCol.push(.219);
        leaveCol.push(1);
      }
      else if(r > 1 && r < 2)
      {
        leaveCol.push(.996);
        leaveCol.push(.929);
        leaveCol.push(.505);
        leaveCol.push(1);
      }
      else{
        leaveCol.push(.964);
        leaveCol.push(.419);
        leaveCol.push(.219);
        leaveCol.push(1);
      }
      
      //leaveCol.push(newL[0]);
    }
  }
  for(let i = 0; i < (tr1.length / 4.0); i++) {
    for(let j = 0; j < (tr1.length / 4.0); j++) {
      offsetsArray.push(i);
      offsetsArray.push(j);
      offsetsArray.push(0);

      colorsArray.push(.878);
      colorsArray.push(.86);
      colorsArray.push(.850);
      colorsArray.push(1.0); // Alpha channel
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let newLeafCol: Float32Array = new Float32Array(leaveCol);
  for(let j = 0; j < tr1.length / 4; j++)
  {
       branchCol.push(.878);
       branchCol.push(.86);
       branchCol.push(.850);
       branchCol.push(1.0);
  }
  let bCol: Float32Array = new Float32Array(branchCol);
  cylinder.setInstanceVBOs(transform1, transform2, transform3, transform4, colors);
  cylinder.setNumInstances(transform1.length / 4);
  leaves.setInstanceVBOs(tr1, tr2, tr3, tr4, newLeafCol);
  leaves.setNumInstances(tr1.length / 4);
  //square.setInstanceVBOs(tr1, tr2, tr3, tr4, colors);
  //square.setNumInstances(tr1.length / 4); // grid of "particles"
}

function main() {
  // Initial display for framerate   
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);
  
  //console.log(final);
  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Load Scene');
  gui.add(controls, "iterations");
  gui.add(controls, 'AngleMin');
  gui.add(controls, 'AngleMax');
  gui.add(controls, 'LeafAmount')
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

  const camera = new Camera(vec3.fromValues(0, -2, 5), vec3.fromValues(0, 6, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
 // gl.enable(gl.BLEND);
  gl.enable(gl.DEPTH_TEST);
  //gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

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
    let it = controls.iterations;
    let ang1 = controls.AngleMin;
    let ang2 = controls.AngleMax;
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      //square,
      leaves,
      cylinder,
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
