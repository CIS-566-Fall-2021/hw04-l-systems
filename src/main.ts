import { vec3, mat4 } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';
import Mesh from './geometry/Mesh';
import LSystem from './LSystem';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
    Iterations: 4,
    Angle: 30,
    LeafColor: [209, 123, 65],
    BranchColor: [116, 96, 84],
    GroundColor: [164, 145, 145],
};

let screenQuad: ScreenQuad;
let leaf: Mesh;
let branch: Mesh;
let ground: Mesh;
let time: number = 0.0;
let axiom = "FX";
let iterations = 4;
let angle = 30;
let leafColor = vec3.fromValues(209./255., 123./255., 65./255.);
let branchColor = vec3.fromValues(116./255., 96./255., 84./255.);
let groundColor = vec3.fromValues(164./255., 145./255., 145./255.);

function loadScene() {
    screenQuad = new ScreenQuad();
    screenQuad.create();

    leaf = new Mesh(readTextFile('./src/models/Leaf.obj'), vec3.fromValues(0, 0, 0));
    leaf.create();

    branch = new Mesh(readTextFile('./src/models/Branch.obj'), vec3.fromValues(0, 0, 0));
    branch.create();

    ground = new Mesh(readTextFile('./src/models/Ground.obj'), vec3.fromValues(0, 0, 0));
    ground.create();

    let m_lsystem = new LSystem(axiom, iterations, angle);
    m_lsystem.draw();

    let branchesTransform = m_lsystem.DrawingRule.branchcesTransform;
    let leavesTransform = m_lsystem.DrawingRule.leavesTransform;

    // Set up instanced rendering data arrays here.
    // The color
    let colorsArray: number[] = [];

    // The transformation matrix
    let column1: number[] = [];
    let column2: number[] = [];
    let column3: number[] = [];
    let column4: number[] = [];

    // Connect to VBOs
    let colors_VBO = new Float32Array(colorsArray);
    let column1_VBO = new Float32Array(column1);
    let column2_VBO = new Float32Array(column2);
    let column3_VBO = new Float32Array(column3);
    let column4_VBO = new Float32Array(column4);

    // Leaves
    for (let i = 0; i < leavesTransform.length; i++) {
        let curTransform = leavesTransform[i];

        colorsArray.push(leafColor[0]);
        colorsArray.push(leafColor[1]);
        colorsArray.push(leafColor[2]);
        colorsArray.push(1.0);

        column1.push(curTransform[0]);
        column1.push(curTransform[1]);
        column1.push(curTransform[2]);
        column1.push(curTransform[3]);

        column2.push(curTransform[4]);
        column2.push(curTransform[5]);
        column2.push(curTransform[6]);
        column2.push(curTransform[7]);

        column3.push(curTransform[8]);
        column3.push(curTransform[9]);
        column3.push(curTransform[10]);
        column3.push(curTransform[11]);

        column4.push(curTransform[12]);
        column4.push(curTransform[13]);
        column4.push(curTransform[14]);
        column4.push(curTransform[15]);
    }
    colors_VBO = new Float32Array(colorsArray);
    column1_VBO = new Float32Array(column1);
    column2_VBO = new Float32Array(column2);
    column3_VBO = new Float32Array(column3);
    column4_VBO = new Float32Array(column4);
    leaf.createInstanceVBOs(colors_VBO, column1_VBO, column2_VBO, column3_VBO, column4_VBO);
    leaf.setNumInstances(leavesTransform.length);

    // Empty the columns
    colorsArray = [];
    column1 = [];
    column2 = [];
    column3 = [];
    column4 = [];

    // Branches
    for (let i = 0; i < branchesTransform.length; i++) {
        let curTransform = branchesTransform[i];

        colorsArray.push(branchColor[0]);
        colorsArray.push(branchColor[1]);
        colorsArray.push(branchColor[2]);
        colorsArray.push(1.0);

        column1.push(curTransform[0]);
        column1.push(curTransform[1]);
        column1.push(curTransform[2]);
        column1.push(curTransform[3]);

        column2.push(curTransform[4]);
        column2.push(curTransform[5]);
        column2.push(curTransform[6]);
        column2.push(curTransform[7]);

        column3.push(curTransform[8]);
        column3.push(curTransform[9]);
        column3.push(curTransform[10]);
        column3.push(curTransform[11]);

        column4.push(curTransform[12]);
        column4.push(curTransform[13]);
        column4.push(curTransform[14]);
        column4.push(curTransform[15]);
    }
    colors_VBO = new Float32Array(colorsArray);
    column1_VBO = new Float32Array(column1);
    column2_VBO = new Float32Array(column2);
    column3_VBO = new Float32Array(column3);
    column4_VBO = new Float32Array(column4);
    branch.createInstanceVBOs(colors_VBO, column1_VBO, column2_VBO, column3_VBO, column4_VBO);
    branch.setNumInstances(branchesTransform.length);

    // Ground
    colorsArray = [groundColor[0], groundColor[1], groundColor[2], 1.0];
    column1 = [50, 0, 0, 0];
    column2 = [0, 50, 0, 0];
    column3 = [0, 0, 50, 0];
    column4 = [30, -38, 0, 1];
    colors_VBO = new Float32Array(colorsArray);
    column1_VBO = new Float32Array(column1);
    column2_VBO = new Float32Array(column2);
    column3_VBO = new Float32Array(column3);
    column4_VBO = new Float32Array(column4);
    ground.createInstanceVBOs(colors_VBO, column1_VBO, column2_VBO, column3_VBO, column4_VBO);
    ground.setNumInstances(1);
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
    gui.add(controls, 'Iterations', 1, 10).step(1).onChange(setIterations);
    gui.add(controls, 'Angle', 0, 90).onChange(setAngle);
    gui.addColor(controls, 'LeafColor').onChange(setLeafColor);
    gui.addColor(controls, 'BranchColor').onChange(setBranchColor);
    gui.addColor(controls, 'GroundColor').onChange(setGroundColor);

    // get canvas and webgl context
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL 2 not supported!');
    }
    // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
    // Later, we can import `gl` from `globals.ts` to access it
    setGL(gl);

    // Initial call to load scene
    loadScene();

    const camera = new Camera(vec3.fromValues(55.26, 69.26, 93.33), vec3.fromValues(1.19, 25.49, -4.05));

    const renderer = new OpenGLRenderer(canvas);
    renderer.setClearColor(0.2, 0.2, 0.2, 1);
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
            leaf,
            branch,
            ground,
        ]);
        stats.end();

        // Tell the browser to call `tick` again whenever it renders a new frame
        requestAnimationFrame(tick);
    }

    window.addEventListener('resize', function () {
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

    function setIterations() {
        iterations = controls.Iterations;
        loadScene();
    }

    function setAngle() {
        angle = controls.Angle;
        loadScene();
    }

    function setBranchColor() {
        branchColor = vec3.fromValues(controls.BranchColor[0] / 255., controls.BranchColor[1] / 255., controls.BranchColor[2] / 255.);
        loadScene();
    }

    function setLeafColor() {
        leafColor = vec3.fromValues(controls.LeafColor[0] / 255., controls.LeafColor[1] / 255., controls.LeafColor[2] / 255.);
        loadScene();
    }

    function setGroundColor() {
        groundColor = vec3.fromValues(controls.GroundColor[0] / 255., controls.GroundColor[1] / 255., controls.GroundColor[2] / 255.);
        loadScene();
    }
}

// A File reader online
function readTextFile(file: string): string {
    var text = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                text = allText;
            }
        }
    }
    rawFile.send(null);
    return text;
}

main();
