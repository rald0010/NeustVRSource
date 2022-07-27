import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

import Stats from 'three/examples/jsm/libs/stats.module'

import ThreeMeshUI from '../src/three-mesh-ui.js';
import VRControl from '../src/utils/VRControl.js';
import ShadowedLight from '../src/utils/ShadowedLight.js';



//import SnakeImage from "../src/assets/spiny_bush_viper.jpg";
//import FontJSON from '../src/assets/Roboto-msdf.json';
//import FontImage from '../src/assets/Roboto-msdf.png';

let container;
let camera, scene, renderer;
let controller1, controller2, controller11, controller22;
let controllerGrip1, controllerGrip2, controllerGrip11, controllerGrip22;
const box = new THREE.Box3();
let scene1, scene2;
let selectedcoffe = false;
let pos = false;
let cof = 0;
let meshContainer, meshes, currentMesh;

let plant1;

let planttito1 = new THREE.Group();
let planttito2 = new THREE.Group();
let planttito3 = new THREE.Group();
let planttito4 = new THREE.Group();


let mesh1;
let mesh22;
let mesh33;
let mesh44;
let mesh2;
let mesh3;
let mesh4;
let mesh5;
let meshcopy1;
let meshcopy2;
let meshcopy3;
let meshcopy4;
let boundingmesh1 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let boundingmesh22 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let boundingmesh33 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let boundingmesh44 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let boundingmesh2 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let boundingmesh3 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let boundingmesh4 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let boundingmesh5 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

const controllers = [];
const oscillators = [];
let controls, group;
let audioCtx = null;
const intersected = [];
const tempMatrix = new THREE.Matrix4();

const objsToTest = [];
let isplaying = false;
// minor pentatonic scale, so whichever notes is striked would be more pleasant
const musicScale = [0, 3, 5, 7, 10];

window.addEventListener('load', init);
window.addEventListener('resize', onWindowResize);


let maincontainer;
let viewUI = false;



let raycaster;
const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;




var progress = document.createElement('div');
var progressBar = document.createElement('div');

const manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    
    console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};

manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

    //element1.style.display = "block";
    console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};

manager.onLoad = function ( ) {
    setTimeout(loaded, 3000)
    
    console.log( 'Loading complete!');

};

function loaded(){
    //element1.style.display = "none"
}



window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('pointerdown', () => {
    selectState = true;
});

window.addEventListener('pointerup', () => {
    selectState = false;
});

window.addEventListener('touchstart', (event) => {
    selectState = true;
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('touchend', () => {
    selectState = false;
    mouse.x = null;
    mouse.y = null;
});


// const stats = Stats()
// document.body.appendChild(stats.dom)




function initAudio() {

    if (audioCtx !== null) {

        return;

    }

    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    function createOscillator() {

        // creates oscillator
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine'; // possible values: sine, triangle, square
        oscillator.start();
        return oscillator;

    }

    oscillators.push(createOscillator());
    oscillators.push(createOscillator());
    //window.oscillators = oscillators;

}







function init() {

    ////////////////////////
    //  Basic Three Setup
    ////////////////////////


    
    progress.appendChild(progressBar);

    document.body.appendChild(progress);


    container = document.createElement('div');
    container.setAttribute("id", "cont1");
    document.body.appendChild(container);


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 3);

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    scene1 = new THREE.Scene();
    scene1.background = new THREE.Color(0xbbbbbb);
    scene1.environment = pmremGenerator.fromScene(environment).texture;

    scene2 = new THREE.Scene();
    scene2.background = new THREE.Color(0xbbbbbb);
    scene2.environment = pmremGenerator.fromScene(environment).texture;

    const grid = new THREE.GridHelper(500, 10, 0xffffff, 0xffffff);
    grid.material.opacity = 0.5;
    grid.material.depthWrite = false;
    grid.material.transparent = true;

    const grid2 = new THREE.GridHelper(500, 10, 0xffffff, 0xffffff);
    grid2.material.opacity = 0.5;
    grid2.material.depthWrite = false;
    grid2.material.transparent = true;

    scene1.add(grid);
    scene2.add(grid2);


    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
    container.appendChild(renderer.domElement);
    

    const element = document.getElementById("VRButton");
    element.style.backgroundColor = "#009999";
    element.style.color = "#fffefe";
    element.style.cssFloat = "left";
    element.style.position = "fixed"
    

    element.addEventListener("click", myFunction);

    function myFunction() {
        initAudio();
    }

    // document.getElementById('VRButton').addEventListener('click', () => {

    //     initAudio();
    intersectObjects
    // });


    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    scene1.add(controller1);



    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    scene1.add(controller2);
    //scene2.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();


    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.addEventListener('connected', controllerConnected);
    controllerGrip1.addEventListener('disconnected', controllerDisconnected);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene1.add(controllerGrip1);



    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.addEventListener('connected', controllerConnected1);
    controllerGrip2.addEventListener('disconnected', controllerDisconnected);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene1.add(controllerGrip2);
    //scene2.add(controllerGrip2);



    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)]);

    const line = new THREE.Line(geometry);
    line.name = 'line';
    line.scale.z = 5;

    controller1.add(line.clone());
    //controller11.add(line.clone());
    controller2.add(line.clone());


    controls = new OrbitControls(camera, container);
    controls.target.set(0, 1.6, 0);
    controls.update();



    let models = new THREE.Group();

    group = new THREE.Group();
    group.position.z = - 0.5;
    scene1.add(group);
    //scene2.add(group);
    const BOXES = 1;

    // const sphere = new THREE.Mesh(
    //     new THREE.IcosahedronBufferGeometry(0.01, 2),
    //     new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true })
    // );

    // //sphere.scale.set( .5, .5, .5 );
    // //sphere.visible = false;
    // sphere.position.x = 1.73;
    // sphere.position.y = 1.23;
    // sphere.position.z = .27;
    // sphere.castShadow = true;
    // sphere.receiveShadow = true;
    // sphere.userData = {
    //     index: 1,
    //     intensity: 2
    // };


    meshContainer = new THREE.Group();
    meshContainer.position.set(0, 1, -1.9);
    scene1.add(meshContainer);

    const sphere = new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(0.3, 1),
        new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true })
    );

    const box = new THREE.Mesh(
        new THREE.BoxBufferGeometry(0.45, 0.45, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x643de3, flatShading: true })
    );

    const cone = new THREE.Mesh(
        new THREE.ConeBufferGeometry(0.28, 0.5, 10),
        new THREE.MeshStandardMaterial({ color: 0xe33d4e, flatShading: true })
    );

    //

    //group.add(sphere);
    // for (let i = 0; i < BOXES; i++) {

    //     const intensity = (i + 1) / BOXES;
    //     const w = 0.1;
    //     const h = 0.1;
    //     const minH = 1;
    //     const geometry = new THREE.BoxGeometry(w, h * i + minH, w);
    //     const material = new THREE.MeshStandardMaterial({
    //         color: new THREE.Color(intensity, 0.1, 0.1),
    //         roughness: 0.7,
    //         metalness: 0.0
    //     });

    //     const object = new THREE.Mesh(geometry, material);
    //     object.position.x = (i - 5) * (w + 0.05);
    //     object.castShadow = true;
    //     object.receiveShadow = true;
    //     object.userData = {
    //         index: i + 1,
    //         intensity: intensity
    //     };

    //     group.add(object);

    // }

    raycaster = new THREE.Raycaster();


    //

    window.addEventListener('resize', onWindowResize);




    let samp = [];

    const group1 = new THREE.Group();
    var group2 = new THREE.Object3D()

    const ktx2Loader = new KTX2Loader().setTranscoderPath('js/libs/basis/').detectSupport(renderer);




    THREE.Cache.enabled = true;


    const loader = new GLTFLoader(manager).setPath('../../assets/');
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('gg.glb', function (gltf) {

        //console.log(gltf.scene);
        gltf.scene.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                //console.log(child);
                if (child.userData.name == "node_id8") {
                    var mesh = new THREE.Mesh(child.geometry.scale(.03, .03, .03), child.material);
                    mesh1 = new THREE.Mesh(child.geometry.scale(.1, .1, .1), child.material);
                    //console.log(child.geometry);
                    //mesh.position.z = -50;
                    mesh1.scale.set(1, 1, 1);
                    mesh1.position.y = 1;
                    mesh1.position.x = .2;
                    mesh1.position.z = .2;
                    mesh1.visible = false;
                    mesh1.userData = {
                        index: 3,
                        intensity: 1
                    };
                    mesh1.name = "mesh1";


                    mesh22 = mesh1.clone();
                    mesh22.scale.set(1, 1, 1);
                    mesh22.position.y = 1;
                    mesh22.position.x = .25;
                    mesh22.position.z = .2;
                    mesh22.visible = false;
                    boundingmesh22.setFromObject(mesh22);
                    mesh22.name = "mesh22";

                    mesh33 = mesh1.clone();
                    mesh33.scale.set(1, 1, 1);
                    mesh33.position.y = 1;
                    mesh33.position.x = .3;
                    mesh33.position.z = .2;
                    mesh33.visible = false;
                    mesh33.name = "mesh33";
                    boundingmesh33.setFromObject(mesh33);


                    mesh44 = mesh1.clone();
                    mesh44.scale.set(1, 1, 1);
                    mesh44.position.y = 1;
                    mesh44.position.x = .35;
                    mesh44.position.z = .2;
                    mesh44.visible = false;
                    mesh44.name = "mesh44";
                    boundingmesh44.setFromObject(mesh44);


                    meshcopy1 = mesh1.clone();
                    meshcopy1.scale.set(1, 1, 1);
                    meshcopy1.position.y = .88;
                    meshcopy1.position.x = -0.04;
                    meshcopy1.position.z = .2;
                    meshcopy1.visible = false;
                    meshcopy1.name = "meshcopy1";
                    //console.log(meshcopy1);


                    meshcopy2 = mesh1.clone();
                    meshcopy2.scale.set(1, 1, 1);
                    meshcopy2.position.y = .88;
                    meshcopy2.position.x = -0.04;
                    meshcopy2.position.z = .145;
                    meshcopy2.visible = false;
                    meshcopy2.name = "meshcopy2";
                    //console.log(meshcopy1);


                    meshcopy3 = mesh1.clone();
                    meshcopy3.scale.set(1, 1, 1);
                    meshcopy3.position.y = .88;
                    meshcopy3.position.x = -0.04;
                    meshcopy3.position.z = .09;
                    meshcopy3.visible = false;
                    meshcopy3.name = "meshcopy3";
                    //console.log(meshcopy1);


                    meshcopy4 = mesh1.clone();
                    meshcopy4.scale.set(1, 1, 1);
                    meshcopy4.position.y = .88;
                    meshcopy4.position.x = -0.04;
                    meshcopy4.position.z = .04;
                    meshcopy4.visible = false;
                    meshcopy4.name = "meshcopy4";
                    //console.log(meshcopy1);


                    boundingmesh1.setFromObject(mesh1);
                    //console.log(boundingmesh1);

                    mesh.scale.set(1, 1, 1);
                    mesh.position.y = -.5;
                    mesh.position.x = -1;
                    mesh.userData = {
                        index: 2,
                        intensity: 1
                    };


                    mesh2 = new THREE.Mesh(
                        new THREE.BoxGeometry(.02, .04, .02),
                        new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true, wireframe: true })
                    );


                    boundingmesh2.setFromObject(mesh2);


                    mesh2.position.y = .88;
                    mesh2.position.x = -0.04;
                    mesh2.position.z = .2;
                    mesh2.visible = false;


                    mesh3 = new THREE.Mesh(
                        new THREE.BoxGeometry(.02, .04, .02),
                        new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true, wireframe: true })
                    );

                    boundingmesh3.setFromObject(mesh3);

                    mesh3.position.y = .88;
                    mesh3.position.x = -0.04;
                    mesh3.position.z = .145;
                    mesh3.visible = false;

                    mesh4 = new THREE.Mesh(
                        new THREE.BoxGeometry(.02, .04, .02),
                        new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true, wireframe: true })
                    );

                    boundingmesh4.setFromObject(mesh4);


                    mesh4.position.y = .88;
                    mesh4.position.x = -0.04;
                    mesh4.position.z = .09;
                    mesh4.visible = false;

                    mesh5 = new THREE.Mesh(
                        new THREE.BoxGeometry(.02, .04, .02),
                        new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true, wireframe: true })
                    );

                    boundingmesh5.setFromObject(mesh5);


                    mesh5.position.y = .88;
                    mesh5.position.x = -0.04;
                    mesh5.position.z = .04;
                    mesh5.visible = false;




                    group.add(meshcopy4);
                    group.add(meshcopy3);
                    group.add(meshcopy2);
                    group.add(meshcopy1);
                    group.add(mesh5);
                    group.add(mesh4);
                    group.add(mesh3);
                    group.add(mesh2);
                    group.add(mesh44);
                    group.add(mesh33);
                    group.add(mesh22);
                    group.add(mesh1);


                    //group.add(mesh);
                    //group2.add(mesh);
                    //group1.add(group2);
                    //group.add(mesh);
                }
                //here in child the geometry and material are available

            }
        });





    });

    loader.load('pot.glb', function (gltf) {

        gltf.scene.position.y = 1;
        gltf.scene.position.z = -.5;
        gltf.scene.name = "pot";
        gltf.scene.visible = false;
        scene1.add(gltf.scene);
        //gltf.scene




    });


    let pickableMeshes;

    

    loader.load('PLANT1.glb', function (gltf) {

        gltf.scene.scale.set(.3,.3,.3)
        gltf.scene.position.y = .1;
        gltf.scene.position.z = .8;
        pickableMeshes = gltf.scene.children;
        
        gltf.scene.visible = true;
        scene1.add(gltf.scene);
        planttito1.add(gltf.scene);
        planttito1.visible = false;
        //gltf.scene

    });

    //pickableMeshes
    

    
    
    
    loader.load('PLANT2.glb', function (gltf) {

        gltf.scene.scale.set(.3, .3, .3)
        gltf.scene.position.y = .1;
        gltf.scene.position.z = .8;
        gltf.scene.name = "plant2";
        gltf.scene.visible = true;
        scene1.add(gltf.scene);
        planttito2.add(gltf.scene);
        planttito2.visible = false;
        //gltf.scene

    });

    loader.load('PLANT3.glb', function (gltf) {

        gltf.scene.scale.set(.1, .1, .1)
        gltf.scene.position.y = .1;
        gltf.scene.position.z = .8;
        gltf.scene.name = "plant3";
        gltf.scene.visible = true;
        scene1.add(gltf.scene);
        planttito3.add(gltf.scene);
        planttito3.visible = false;
        //gltf.scene

    });

    loader.load('PLANT4.glb', function (gltf) {

        gltf.scene.scale.set(.1, .1, .1)
        gltf.scene.position.y = .1;
        gltf.scene.position.z = .8;
        gltf.scene.name = "plant4";
        gltf.scene.visible = true;
        scene1.add(gltf.scene);
        planttito4.add(gltf.scene);
        planttito4.visible = false;
        //gltf.scene

    });



    
    //plant1.visible = true;

    // plant1.traverse((node) => {
    //     if (node instanceof THREE.Mesh) {
           
    //     }
    //   });

      

    planttito1.visible = planttito2.visible = planttito3.visible = planttito4.visible = false;

    meshContainer.add(planttito1 ,planttito2, planttito3, planttito4);

    meshes = [planttito1 ,planttito2, planttito3, planttito4];
    currentMesh = 0;

    showMesh(currentMesh);

    //models.position.y = -.1;
    //models.position.x = -1;

    //scene.add(models);
    //scene.add(group);
    //grabVR.grabableObjects().push(group1);
    //scene.add(group1);






    // Panel
    //////////
    //addpanel();
    //addpanel1();
    makePanel();
    //SeedGrowth();
    //

    animate();

    scene = scene1;

}

function showMesh(id) {

    meshes.forEach((mesh, i) => {

        mesh.visible = i === id ? true : false;

    });

}



function animate() {





    renderer.setAnimationLoop(render);

}


function makePanel() {

    let count = 0;

    const container = new ThreeMeshUI.Block({
        //ref: "container",
        justifyContent: 'center',
        contentDirection: 'row-reverse',
        fontFamily: "../../assets/Roboto-msdf.json",
        fontTexture: "../../assets/Roboto-msdf.png",
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11
    });


    const container1 = new ThreeMeshUI.Block({
        ref: "container",
        //justifyContent: 'center',
        //contentDirection: 'row-reverse',
        fontFamily: "../../assets/Roboto-msdf.json",
        fontTexture: "../../assets/Roboto-msdf.png",
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11
    });

    container1.name = "main";
    container.name = "prenextbtn";



    container.position.set(0, 0.6, -1.2);
    container.rotation.x = -0.55;
    container1.position.set(0, 1.5, -1.8);
    container1.rotation.x = -0.35;

    const title = new ThreeMeshUI.Block({
        height: 0.2,
        width: 1.2,
        margin: 0.025,
        justifyContent: "center",
        fontSize: 0.09,
    });

    title.add(
        new ThreeMeshUI.Text({
            content: "Welcome to Our VR Module",
        })
    );

    container1.add(title);


    //

    const leftSubBlock = new ThreeMeshUI.Block({
        height: 0.8,
        width: 1,
        margin: 0.025,
        padding: 0.025,
        textAlign: "center",
        justifyContent: "end",
    });



    const rightSubBlock = new ThreeMeshUI.Block({
        height: 0.8,
        width: 1.5,
        //margin: 0.025,
    });





    // const subSubBlock1 = new ThreeMeshUI.Block({
    //     height: 0.1,
    //     width: 0.5,

    //     fontSize: 0.04,
    //     justifyContent: "center",
    //     backgroundOpacity: 0,
    // }).add(
    //     new ThreeMeshUI.Text({
    //         content: "Welcome to Our VR module",
    //     }),


    // );





    let subSubBlock222 = new ThreeMeshUI.Block({
        height: 0.8,
        width: 0.5,
        margin: 0.01,
        padding: 0.02,
        fontSize: 0.025,
        alignItems: "start",
        textAlign: 'justify',
        backgroundOpacity: 0,
    }).add(
        new ThreeMeshUI.Text({
            content:
                `2.  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                `,
        })


    );




    const subSubBlock2 = new ThreeMeshUI.Block({
        height: 0.8,
        width: 1.2,
        margin: 0.05,
        padding: 0.02,
        fontSize: 0.5,
        alignItems: 'start',
        textAlign: 'justify-left',
        backgroundOpacity: 0,
    });


    subSubBlock2.onAfterUpdate = function () {
        this.frame.layers.set(count % 2);
    };


    let page1 = []
    page1[0] = 'Welcome to the first part of our virtual realitty module "Planting Seeds" click Next to continue.';
    page1[1] = 'Step 1: Find the Coffee Seed and Pick it Up.';
    page1[2] = 'Step 2: Find the seedling tray and see the empty holes, Put the seeds there';
    page1[3] = 'Congratulations! Planting Completed! Click "Next" to Proceed.';


    const text = new ThreeMeshUI.Text({
        content: 'Welcome to the first part of our virtual realitty module "Planting Seeds" click Next to continue',
        height: 0.8,
        width: 0.15,
        margin: 0.05,
        padding: 0.2,
        fontSize: 0.09,
        alignItems: 'start',
        textAlign: 'justify-left',
        backgroundOpacity: 0,
    });

    const counter = new ThreeMeshUI.Text({
        content: '0',
        height: 0.8,
        width: 0.5,
        margin: 0.01,
        padding: 0.02,
        fontSize: 0.025,
        alignItems: 'start',
        textAlign: 'left',
        backgroundOpacity: 0,
    });

    subSubBlock2.add(text, counter);


    subSubBlock2.name = "subblock2";

    rightSubBlock.add(subSubBlock2);


    //

    const contentContainer = new ThreeMeshUI.Block({
        contentDirection: "row",
        padding: 0.02,
        margin: 0.025,
        backgroundOpacity: 0,
    });

    contentContainer.add(rightSubBlock);
    container1.add(contentContainer);





    // new THREE.TextureLoader().load("assets/roastimg.jpg", (texture) => {
    //     leftSubBlock.set({
    //         backgroundTexture: texture,
    //     });
    // });





    scene1.add(container, container1);





    // triggers updates to the component to test onAfterUpdate





    // BUTTONS

    // We start by creating objects containing options that we will use with the two buttons,
    // in order to write less code.

    const buttonOptions = {
        width: 0.4,
        height: 0.15,
        justifyContent: 'center',
        offset: 0.05,
        margin: 0.02,
        borderRadius: 0.075
    };

    // Options for component.setupState().
    // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

    const hoveredStateAttributes = {
        state: 'hovered',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x999999),
            backgroundOpacity: 1,
            fontColor: new THREE.Color(0xffffff)
        },
    };

    const idleStateAttributes = {
        state: 'idle',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x666666),
            backgroundOpacity: 0.3,
            fontColor: new THREE.Color(0xffffff)
        },
    };

    // Buttons creation, with the options objects passed in parameters.

    const buttonNext = new ThreeMeshUI.Block(buttonOptions);
    const buttonPrevious = new ThreeMeshUI.Block(buttonOptions);
    buttonNext.name = "btnnext";
    // Add text to buttons

    buttonNext.add(
        new ThreeMeshUI.Text({ content: 'Next' })
    );

    buttonPrevious.add(
        new ThreeMeshUI.Text({ content: 'Previous' })
    );

    // Create states for the buttons.
    // In the loop, we will call component.setState( 'state-name' ) when mouse hover or clickgetObjectByName

    const selectedAttributes = {
        offset: 0.02,
        backgroundColor: new THREE.Color(0x777777),
        fontColor: new THREE.Color(0x222222)
    };

    buttonNext.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {

            if (cof == 0) {

                mesh1.visible = true;
                var object = scene.getObjectByName("pot", true);
                object.visible = true;
                selectedcoffe = true;

                cof++

            }


            if (cof == 3) {
                GrowthStage();
            }

            // scene2.add(controller1);
            // scene2.add(controllerGrip1);
            // scene2.add(group);
            // scene = scene2;

            // while(scene1.children.length > 0){ 
            //     scene1.remove(scene1.children[0]); 
            // }




            //console.log(count)

            if (selectedcoffe) {

                let caller = "page" + count.toString();

                if (count >= 0 && page1.length - 1 > count) {
                    count++;
                    text.set({ content: String(page1[count]) });
                    selectedcoffe = false;
                    console.log(count);
                } else {


                    count++;
                    console.log(count);

                }



            }



            // var object = scene.getObjectByName("subblock2", true);
            // subSubBlock2.childrenTexts[0].content = "dasdasd";

            // console.log(subSubBlock2.childrenTexts[0].content)
            // console.log(object)
        }
    });
    buttonNext.setupState(hoveredStateAttributes);
    buttonNext.setupState(idleStateAttributes);

    //

    buttonPrevious.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {



            // console.log(count)
            // let caller = "page" + count.toString();
            // if (count >= 1 && page1.length > count) {
            //     count--;
            //     text.set({ content: String(page1[count]) });
            // }

            //console.log("pressed")

        }
    });
    buttonPrevious.setupState(hoveredStateAttributes);
    buttonPrevious.setupState(idleStateAttributes);

    //

    container.add(buttonNext, buttonPrevious);
    objsToTest.push(buttonNext, buttonPrevious);

}


function controllerConnected(evt) {

    controllers.push({
        gamepad: evt.data.gamepad,
        grip: evt.target,
        colliding: false,
        playing: false
    });

}


function controllerConnected1(evt) {
    pos = true;
    controllers.push({
        gamepad: evt.data.gamepad,
        grip: evt.target,
        colliding: false,
        playing: false
    });

}


function controllerDisconnected(evt) {

    const index = controllers.findIndex(o => o.controller === evt.target);
    if (index !== - 1) {

        controllers.splice(index, 1);

    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}


function render() {

    if (pos) {
        boundingmesh1.copy(mesh1.geometry.boundingBox).applyMatrix4(mesh1.matrixWorld);
        boundingmesh22.copy(mesh22.geometry.boundingBox).applyMatrix4(mesh22.matrixWorld);
        boundingmesh33.copy(mesh33.geometry.boundingBox).applyMatrix4(mesh33.matrixWorld);
        boundingmesh44.copy(mesh44.geometry.boundingBox).applyMatrix4(mesh44.matrixWorld);

        boundingmesh2.copy(mesh2.geometry.boundingBox).applyMatrix4(mesh2.matrixWorld);
        boundingmesh3.copy(mesh3.geometry.boundingBox).applyMatrix4(mesh3.matrixWorld);
        boundingmesh4.copy(mesh4.geometry.boundingBox).applyMatrix4(mesh4.matrixWorld);
        boundingmesh5.copy(mesh5.geometry.boundingBox).applyMatrix4(mesh5.matrixWorld);


        checkcollision();

    }


    // console.log(mesh1.geometry.boundingBox);
    // console.log(mesh2.geometry.boundingBox);
    ThreeMeshUI.update();

    controls.update();

    updateButtons();

    updateButtons();

    //handleCollisions();

    cleanIntersected();


    intersectObjects(controller1);

    intersectObjects(controller2);



    

    renderer.render(scene, camera);


}


function updateButtons() {

    //Find closest intersecting object


    // if (controller.userData.selected !== undefined) return;

    // const line = controller.getObjectByName('line');
    // const intersections = getIntersections(controller);

    // if (intersections.length > 0) {

    //     const intersection = intersections[0];

    //     const object = intersection.object;
    //     object.material.emissive.r = 1;
    //     intersected.push(object);

    //     line.scale.z = intersection.distance;

    // } else {

    //     line.scale.z = 5;

    // }





    let intersect;

    if (renderer.xr.isPresenting) {

        //controller.setFromController( 0, raycaster.ray );

        intersect = raycast();

        // Position the little white dot at the end of the controller pointing ray
        //if (intersect) controller.setPointerAt(0, intersect.point);

    } else if (mouse.x !== null && mouse.y !== null) {

        raycaster.setFromCamera(mouse, camera);

        intersect = raycast();

    }

    // Update targeted button state (if any)

    if (intersect && intersect.object.isUI) {

        if (selectState) {

            // Component.setState internally call component.set with the options you defined in component.setupState
            intersect.object.setState('selected');

        } else {

            // Component.setState internally call component.set with the options you defined in component.setupState
            intersect.object.setState('hovered');

        }

    }

    // Update non-targeted buttons state

    objsToTest.forEach((obj) => {

        if ((!intersect || obj !== intersect.object) && obj.isUI) {

            // Component.setState internally call component.set with the options you defined in component.setupState
            obj.setState('idle');

        }

    });

}


function handleCollisions() {

    for (let i = 0; i < group.children.length; i++) {

        group.children[i].collided = false;

    }


    // const firstObject = group.children[0];
    // const secondObject = group.children[1];

    // firstBB.setFromObject(firstObject);

    // secondBB.setFromObject(secondObject);

    // var collision = firstBB.isIntersectionBox(secondBB);

    // if (collision) {
    //     alert("collided")
    // }

    for (let g = 0; g < controllers.length; g++) {

        const controller = controllers[g];
        controller.colliding = false;

        const { grip, gamepad } = controller;
        const sphere = {
            radius: 0.03,
            center: grip.position
        };

        const supportHaptic = 'hapticActuators' in gamepad && gamepad.hapticActuators != null && gamepad.hapticActuators.length > 0;




        for (let i = 0; i < group.children.length; i++) {


            const child = group.children[i];
            box.setFromObject(child);
            if (box.intersectsSphere(sphere)) {



                child.material.emissive.b = 1;
                const intensity = child.userData.index / group.children.length;
                //child.scale.setScalar(1 + Math.random() * 0.1 * intensity);

                if (supportHaptic) {

                    gamepad.hapticActuators[0].pulse(intensity, 100);

                }

                const musicInterval = musicScale[child.userData.index % musicScale.length] + 12 * Math.floor(child.userData.index / musicScale.length);
                oscillators[g].frequency.value = 110 * Math.pow(2, musicInterval / 12);
                controller.colliding = true;
                group.children[i].collided = true;




            }

        }



        if (controller.colliding) {

            if (!controller.playing) {

                controller.playing = true;
                oscillators[g].connect(audioCtx.destination);
                //isplaying = true;
                //setVisible();


            }

        } else {

            if (controller.playing) {

                controller.playing = false;
                oscillators[g].disconnect(audioCtx.destination);
                //isplaying = false;

            }

        }

    }

    for (let i = 0; i < group.children.length; i++) {

        let child = group.children[i];
        if (!child.collided) {

            // reset uncollided boxes
            child.material.emissive.b = 0;
            child.scale.setScalar(1);

        }

    }

}

function GrowthStage() {

    var object = scene.getObjectByName("main", true);
    var object1 = scene.getObjectByName("prenextbtn", true);
    var object2 = scene.getObjectByName("pot", true);
    var object3 = scene.getObjectByName("mesh1", true);
    var object4 = scene.getObjectByName("mesh22", true);
    var object5 = scene.getObjectByName("mesh33", true);
    var object6 = scene.getObjectByName("mesh44", true);

    var object7 = scene.getObjectByName("meshcopy1", true);
    var object8 = scene.getObjectByName("meshcopy2", true);
    var object9 = scene.getObjectByName("meshcopy3", true);
    var object10 = scene.getObjectByName("meshcopy4", true);


    object.position.z = 100;
    object1.position.z = 100;
    object2.position.z = 100;
    object3.position.z = 100;
    object4.position.z = 100;

    object5.position.z = 100;
    object6.position.z = 100;
    object7.position.z = 100;
    object8.position.z = 100;
    object9.position.z = 100;
    object10.position.z = 100;


}



function SeedGrowth() {

    // Container block, in which we put the two buttons.
    // We don't define width and height, it will be set automatically from the children's dimensions
    // Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

    const container = new ThreeMeshUI.Block({
        //ref: "container",
        justifyContent: 'center',
        contentDirection: 'row-reverse',
        fontFamily: "../../assets/Roboto-msdf.json",
        fontTexture: "../../assets/Roboto-msdf.png",
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11
    });

    container.position.set(0, 0.6, -1.);
    container.rotation.x = -0.55;
    scene1.add(container);

    // BUTTONS

    // We start by creating objects containing options that we will use with the two buttons,
    // in order to write less code.

    const buttonOptions = {
        width: 0.4,
        height: 0.15,
        justifyContent: 'center',
        offset: 0.05,
        margin: 0.02,
        borderRadius: 0.075
    };

    // Options for component.setupState().
    // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

    const hoveredStateAttributes = {
        state: 'hovered',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x999999),
            backgroundOpacity: 1,
            fontColor: new THREE.Color(0xffffff)
        },
    };

    const idleStateAttributes = {
        state: 'idle',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x666666),
            backgroundOpacity: 0.3,
            fontColor: new THREE.Color(0xffffff)
        },
    };

    // Buttons creation, with the options objects passed in parameters.

    const buttonNext = new ThreeMeshUI.Block(buttonOptions);
    const buttonPrevious = new ThreeMeshUI.Block(buttonOptions);

    // Add text to buttons

    buttonNext.add(
        new ThreeMeshUI.Text({ content: 'next' })
    );

    buttonPrevious.add(
        new ThreeMeshUI.Text({ content: 'previous' })
    );

    // Create states for the buttons.
    // In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

    const selectedAttributes = {
        offset: 0.02,
        backgroundColor: new THREE.Color(0x777777),
        fontColor: new THREE.Color(0x222222)
    };

    buttonNext.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {

            currentMesh = (currentMesh + 1) % 4;
            showMesh(currentMesh);

        }
    });
    buttonNext.setupState(hoveredStateAttributes);
    buttonNext.setupState(idleStateAttributes);

    //

    buttonPrevious.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {

            currentMesh -= 1;
            if (currentMesh < 0) currentMesh = 3;
            showMesh(currentMesh);

        }
    });
    buttonPrevious.setupState(hoveredStateAttributes);
    buttonPrevious.setupState(idleStateAttributes);

    //

    container.add(buttonNext, buttonPrevious);
    objsToTest.push(buttonNext, buttonPrevious);

}



function checkcollision() {


    if (boundingmesh1.intersectsBox(boundingmesh2)) {
        changeimage();
        //isVisible();
        meshcopy1.visible = true;

        mesh1.visible = false;
        mesh22.visible = true;


    }
    if (boundingmesh22.intersectsBox(boundingmesh3)) {
        changeimage2();
        //isVisible();

        meshcopy2.visible = true;

        mesh22.visible = false;
        mesh33.visible = true;

    }
    if (boundingmesh33.intersectsBox(boundingmesh4)) {
        changeimage3();
        //isVisible();
        meshcopy3.visible = true;

        mesh33.visible = false;
        mesh44.visible = true;
        //notVisible();
    }
    if (boundingmesh44.intersectsBox(boundingmesh5)) {
        //changeimage4();
        //isVisible();

        if (cof == 2) {
            selectedcoffe = true;
            var object = scene1.getObjectByName("btnnext", true);
            object.setState('selected');
            cof++;
        }


        meshcopy4.visible = true;
        mesh1.visible = false;
        mesh44.visible = false;
        //notVisible();
    }


}






function raycast() {



    // tempMatrix.identity().extractRotation(controller.matrixWorld);

    // raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    // raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

    // return raycaster.intersectObjects(group.children, false);



    return objsToTest.reduce((closestIntersection, obj) => {

        const intersection = raycaster.intersectObject(obj, true);

        if (!intersection[0]) return closestIntersection;

        if (!closestIntersection || intersection[0].distance < closestIntersection.distance) {

            intersection[0].object = obj;

            return intersection[0];

        }

        return closestIntersection;

    }, null);

}


function changeimage() {

    var image = scene1.getObjectByName("image", true);

    new THREE.TextureLoader().load("../../assets/threejs.png", (texture) => {
        image.set({
            backgroundTexture: texture,
        });
    });



}


function changeimage2() {

    var image = scene1.getObjectByName("image", true);

    new THREE.TextureLoader().load("../../assets/threejs.png", (texture) => {
        image.set({
            backgroundTexture: texture,
        });
    });



}
function changeimage3() {

    var image = scene1.getObjectByName("image", true);

    new THREE.TextureLoader().load("../../assets/threejs.png", (texture) => {
        image.set({
            backgroundTexture: texture,
        });
    });



}
function changeimage4() {

    var image = scene1.getObjectByName("image", true);

    new THREE.TextureLoader().load("../../assets/threejs.png", (texture) => {
        image.set({
            backgroundTexture: texture,
        });
    });



}


function addpanel() {

    let count = 0;


    const container = new ThreeMeshUI.Block({
        //ref: "container",
        justifyContent: 'center',
        contentDirection: 'row-reverse',
        fontFamily: "assets/Roboto-msdf.json",
        fontTexture: "assets/Roboto-msdf.png",
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11
    });

    container.position.set(0, 0.6, -1.25);
    container.rotation.x = -0.55;


    const container1 = new ThreeMeshUI.Block({
        ref: "pan",
        //justifyContent: 'center',
        //contentDirection: 'row-reverse',
        // height: 1.5,
        // width: 1.5,
        fontFamily: "assets/Roboto-msdf.json",
        fontTexture: "assets/Roboto-msdf.png",
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11
    });

    container1.onAfterUpdate = function () {
        this.frame.layers.set(count % 2);
    };





    container1.position.set(0, 1.8, -1.5);
    container1.rotation.x = -0.35;


    // container1.position.set(2.3, 3, .1);
    // container1.rotation.x = 0;
    // container1.rotation.y = -1.7;

    const title = new ThreeMeshUI.Block({
        height: 0.2,
        width: .6,
        margin: 0.025,
        justifyContent: "center",
        fontSize: 0.05,
    });

    title.add(
        new ThreeMeshUI.Text({
            content: 'Congratulations You Planted your first Seed!',
        }),
        new ThreeMeshUI.Text({
            content: ' Please Plant the remaining coffee beens to proceed.',
        })
    );


    const content = new ThreeMeshUI.Block({
        height: 0.2,
        width: .6,
        margin: 0.025,
        justifyContent: "center",
        fontSize: 0.05,
    });

    content.add(
        new ThreeMeshUI.Text({
            content: "Plant the remaining coffee",
        })
    );


    container1.add(title);
    //container1.add(content);

    //

    const leftSubBlock = new ThreeMeshUI.Block({
        height: 1.2,
        width: 1.50,
        margin: 0.025,
        padding: 0.025,
        textAlign: "center",
        justifyContent: "end",
    });



    const rightSubBlock = new ThreeMeshUI.Block({

        margin: 0.025,
    });

    const subSubBlock1 = new ThreeMeshUI.Block({
        height: 0.35,
        width: 0.5,

        fontSize: 0.04,
        justifyContent: "center",
        backgroundOpacity: 0,
    }).add(
        new ThreeMeshUI.Text({
            content: "Coffee Roaster Parts",
        }),

        // new ThreeMeshUI.Text({
        //   content: "bristly",
        //   fontColor: new THREE.Color(0x92e66c),
        // }),

        // new ThreeMeshUI.Text({
        //   content: " appearance.",
        // })
    );



    rightSubBlock.add(subSubBlock1);

    //

    // const contentContainer = new ThreeMeshUI.Block({
    //     contentDirection: "row",
    //     padding: 0.02,
    //     margin: 0.025,
    //     backgroundOpacity: 0,
    // });

    // contentContainer.add(leftSubBlock);
    // container1.add(contentContainer);





    // new THREE.TextureLoader().load("assets/roast.jpg", (texture) => {
    //     leftSubBlock.set({
    //         backgroundTexture: texture,
    //     });
    // });


    const buttonOptions = {
        width: 0.4,
        height: 0.15,
        justifyContent: 'center',
        offset: 0.05,
        margin: 0.02,
        borderRadius: 0.075
    };

    // Options for component.setupState().
    // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

    const hoveredStateAttributes = {
        state: 'hovered',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x999999),
            backgroundOpacity: 1,
            fontColor: new THREE.Color(0xffffff)
        },
    };

    const idleStateAttributes = {
        state: 'idle',
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0x666666),
            backgroundOpacity: 0.3,
            fontColor: new THREE.Color(0xffffff)
        },
    };




    const buttonNext = new ThreeMeshUI.Block(buttonOptions);
    const buttonPrevious = new ThreeMeshUI.Block(buttonOptions);

    // Add text to buttons

    buttonNext.add(
        new ThreeMeshUI.Text({ content: 'next' })
    );

    buttonPrevious.add(
        new ThreeMeshUI.Text({ content: 'previous' })
    );


    const selectedAttributes = {
        offset: 0.02,
        backgroundColor: new THREE.Color(0x777777),
        fontColor: new THREE.Color(0x222222)
    };




    buttonNext.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {


            // var object = scene.getObjectByName("subblock2", true);
            // subSubBlock2.childrenTexts[0].content = "dasdasd";

            // console.log(subSubBlock2.childrenTexts[0].content)
            // console.log(object)
        }
    });







    buttonNext.setupState(hoveredStateAttributes);
    buttonNext.setupState(idleStateAttributes);

    //

    buttonPrevious.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {




        }
    });
    buttonPrevious.setupState(hoveredStateAttributes);
    buttonPrevious.setupState(idleStateAttributes);


    leftSubBlock.name = "image";

    container.add(buttonNext, buttonPrevious);
    objsToTest.push(buttonNext, buttonPrevious);
    container1.visible = false;
    container1.name = "adpan";
    scene1.add(container1, container);



}













function isVisible() {

    var object = scene1.getObjectByName("adpan", true);
    object.visible = true;
    isplaying = true;
    // if(isplaying){
    //     object.visible = true;
    // }else{
    //     object.visible = false;
    // }

}


function notVisible() {

    var object = scene1.getObjectByName("adpan", true);
    object.visible = false;
    isplaying = false;
    // if(isplaying){
    //     object.visible = true;
    // }else{
    //     object.visible = false;
    // }




}


function setVisible() {

    if (!isplaying) {
        isVisible()
    } else {
        unsetVisible()
    }

}


function unsetVisible() {

    if (isplaying) notVisible()

}



function onSelectStart(event) {

    //selectedcoffe= true;
    if (cof == 1) {
        cof++
        selectedcoffe = true;
        var object = scene1.getObjectByName("btnnext", true);
        object.setState('selected');


    }


    selectState = true;
    const controller = event.target;

    const intersections = getIntersections(controller);

    if (intersections.length > 0) {

        const intersection = intersections[0];

        const object = intersection.object;
        object.material.emissive.b = 1;
        controller.attach(object);

        controller.userData.selected = object;

    }

}


function onSelectEnd(event) {

    //selectedcoffe = false;
    selectState = false;

    const controller = event.target;

    if (controller.userData.selected !== undefined) {

        const object = controller.userData.selected;
        object.material.emissive.b = 0;
        group.attach(object);

        controller.userData.selected = undefined;

    }


}

function getIntersections(controller) {

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

    return raycaster.intersectObjects(group.children, false);

}

function intersectObjects(controller) {

    // Do not highlight when already selected

    if (controller.userData.selected !== undefined) return;

    const line = controller.getObjectByName('line');
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {

        const intersection = intersections[0];

        const object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push(object);

        line.scale.z = intersection.distance;

    } else {

        line.scale.z = 5;

    }

}

function cleanIntersected() {

    while (intersected.length) {

        const object = intersected.pop();
        object.material.emissive.r = 0;

    }

}