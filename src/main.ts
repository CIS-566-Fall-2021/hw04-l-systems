import {vec2,vec3,quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Cylinder from './geometry/Cylinder';
import Mesh from './geometry/Mesh';
import Leaf from './geometry/Leaf';
import Cube from './geometry/Cube';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { generateRandomNumber, setGL, getRandomInt, createGrid, file_string } from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Lsystem from './Lsystem';
import Drawable from './rendering/gl/Drawable';
import Plane from './geometry/plane';
import { leaf_floor, InstanceInfo } from './DrawingRule';


// gui option const  
const controls = {
  'Load Scene': loadScene,
};
export const l_system_control = {
  leaves_level: 2,
  leaf_probability: 0.99,
  randomTwistAngle:20,
  max_iteration: 10,
  rotate_Angle: 30,
  branch_extend_probability:0.05,

};
export const scene_control = {
   max_tree_number: 30,
   max_floor_leaves: 10000,
   depth_fog_color:[247, 215, 218],
};

// global 
let time: number = 0.0;
let m : Mesh; // Mesh for testing
let leaf : Leaf[]=[]; // for leaves on the ground
let p : Plane; // ground
let l_system: Lsystem[]=[]; // our l-system
let mesh_array_branch:Array<Drawable> =[] ; // branches mesh
let mesh_array_leaf:Array<Drawable> = []; // leaves
let screen : ScreenQuad; // background mesh


// main func -- load scene
function loadScene() {
  // empty array for re-load
  l_system.length = 0;
  mesh_array_branch.length = 0;
  mesh_array_leaf.length = 0;
  leaf.length = 0;

  // set up lsystem
  // center default trees
  l_system[0] = new Lsystem(vec3.fromValues(0,0,-3),9);
  l_system[1] = new Lsystem(vec3.fromValues(-8,-2,5),9);
  // randomly generate tree
  let num = getRandomInt(scene_control.max_tree_number*0.8, scene_control.max_tree_number);
  let grids = createGrid();
  
  for(var i = 0; i<num;i++){
    var index = Math.floor(Math.random()*grids.length);
    var grid = grids[index]; // randomly shuffle a grid from grids
    grids.splice(index, 1); // remove that grid
    var iter = getRandomInt(l_system_control.max_iteration-2.0, l_system_control.max_iteration);// at least 7 to hold shape
    // each tree needs at least around 6 * 5, place them randomly in 5x5 grid.
    var pos = vec3.fromValues(grid[0]*6+generateRandomNumber(3,3.5),0,-grid[1]*5-generateRandomNumber(2,4));
    l_system[i+2] = new Lsystem(pos,iter);
  }

  // setup mesh array
  for(var l of l_system){
    l.draw();
    mesh_array_branch.push(l.cylinder_mesh);
    mesh_array_leaf.push(l.leaf_mesh_red);
    mesh_array_leaf.push(l.leaf_mesh_green);
    mesh_array_leaf.push(l.leaf_mesh_orange);
  }  
  // set up background
  backgroundSetup();
}

function backgroundSetup(){

  // background
  // plane
  p = new Plane(vec3.fromValues(0,-0.1,0), vec2.fromValues(450,450), 20);
  p.create();
  p.setNumInstances(1);

  // screen
  screen = new ScreenQuad();
  screen.create();
  screen.setNumInstances(1);

  var info = new InstanceInfo();
  leaf[0] = new Leaf(file_string.leaf_obj, file_string.red_text);
  var num = getRandomInt(scene_control.max_floor_leaves/2,scene_control.max_floor_leaves);
  leaf_floor(info,leaf[0],num);
  leaf[1] = new Leaf(file_string.leaf_obj,file_string.yellow_text);
  info = new InstanceInfo();
  num = getRandomInt(scene_control.max_floor_leaves/2,scene_control.max_floor_leaves);
  leaf_floor(info,leaf[1],num);
  leaf[2] = new Leaf(file_string.leaf_obj, file_string.black_text);
  num = getRandomInt(scene_control.max_floor_leaves/2,scene_control.max_floor_leaves);
  info = new InstanceInfo();
  leaf_floor(info,leaf[2],num);
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
  gui.add(controls, 'Load Scene');
  var c = gui.addFolder('L_system setting');
  
  c.add(l_system_control,'leaves_level',0,10).step(1);
  c.add(l_system_control,'leaf_probability',0.0,1).step(0.01);
  c.add(l_system_control,'randomTwistAngle',10,100);
  c.add(l_system_control,'max_iteration',4,10).step(1);
  c.add(l_system_control,"rotate_Angle",20,60);
  c.add(l_system_control,"branch_extend_probability",0.0,0.12).step(0.01);
  c.open();

  var f = gui.addFolder("Scene setting");
  f.add(scene_control,"max_tree_number",0,60).step(1);
  f.add(scene_control,"max_floor_leaves",0,20000).step(100);
  f.addColor(scene_control,"depth_fog_color");
  f.open();

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

  const camera = new Camera(vec3.fromValues(50,50,50), vec3.fromValues(0, 5, 0));

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
  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);
  const leaf_shader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/leaf-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/leaf-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    leaf_shader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screen]);
    renderer.render(camera, instancedShader, mesh_array_branch);
    renderer.render(camera, leaf_shader, mesh_array_leaf);
    renderer.render(camera,lambert, [p]);
    renderer.render(camera, instancedShader, leaf);
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
