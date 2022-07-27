import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

import ThreeMeshUI from '../src/three-mesh-ui.js';
import VRControl from '../src/utils/VRControl.js';
import ShadowedLight from '../src/utils/ShadowedLight.js';



//import SnakeImage from "../src/assets/spiny_bush_viper.jpg";
//import FontJSON from '../src/assets/Roboto-msdf.json';
//import FontImage from '../src/assets/Roboto-msdf.png';

let container;
let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
const box = new THREE.Box3();

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


let raycaster;
const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;

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


    container = document.createElement('div');
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

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbbbbb);
    scene.environment = pmremGenerator.fromScene(environment).texture;

    const grid = new THREE.GridHelper(500, 10, 0xffffff, 0xffffff);
    grid.material.opacity = 0.5;
    grid.material.depthWrite = false;
    grid.material.transparent = true;
    scene.add(grid);



    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
    container.appendChild(renderer.domElement);

    const element = document.getElementById("VRButton");

    element.addEventListener("click", myFunction);

    function myFunction() {
        initAudio();
    }

    // document.getElementById('VRButton').addEventListener('click', () => {

    //     initAudio();

    // });


    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.addEventListener('connected', controllerConnected);
    controllerGrip1.addEventListener('disconnected', controllerDisconnected);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.addEventListener('connected', controllerConnected);
    controllerGrip2.addEventListener('disconnected', controllerDisconnected);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);



    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)]);

    const line = new THREE.Line(geometry);
    line.name = 'line';
    line.scale.z = 5;

    controller1.add(line.clone());
    controller2.add(line.clone());


    controls = new OrbitControls(camera, container);
    controls.target.set(0, 1.6, 0);
    controls.update();



    let models = new THREE.Group();

    group = new THREE.Group();
    group.position.z = - 0.5;
    scene.add(group);
    const BOXES = 1;

    const sphere = new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(0.01, 2),
        new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true })
    );

    //sphere.scale.set( .5, .5, .5 );
    //sphere.visible = false;
    sphere.position.x = 1.73;
    sphere.position.y = 1.23;
    sphere.position.z = .27;
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.userData = {
        index: 1,
        intensity: 2
    };
    models.add(group);
    group.add(sphere);
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


    const ktx2Loader = new KTX2Loader()
        .setTranscoderPath('js/libs/basis/')
        .detectSupport(renderer);

    const loader = new GLTFLoader().setPath('assets/');
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('roastingmachine.glb', function (gltf) {

        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.position.y = 1;
        gltf.scene.position.x = 2;
        gltf.scene.rotation.y = 1.5
        gltf.name = "roast";
        scene.add(gltf.scene);

        models.add(gltf.scene);

        render();

    });



    //console.log(samp);
    //models.scale.set(2, 2, 2);
    models.position.y = -.5;
    models.position.x = -1;
    scene.add(models);






    // Panel
    //////////
    addpanel();
    makePanel();

    //

    animate();

}


function showMesh(id) {

    // meshes.forEach( ( mesh, i ) => {

    // 	mesh.visible = i === id ? true : false;


    // } );


}

function animate() {

    renderer.setAnimationLoop(render);

}


function makePanel() {

    let count = 0;
    // Container block, in which we put the two buttons.
    // We don't define width and height, it will be set automatically from the children's dimensions
    // Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally






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


    const container1 = new ThreeMeshUI.Block({
        ref: "container",
        //justifyContent: 'center',
        //contentDirection: 'row-reverse',
        fontFamily: "assets/Roboto-msdf.json",
        fontTexture: "assets/Roboto-msdf.png",
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11
    });



    container.position.set(0, 0.6, -1.2);
    container.rotation.x = -0.55;




    container1.position.set(0, 1.8, -1.8);
    container1.rotation.x = -0.35;

    const title = new ThreeMeshUI.Block({
        height: 0.2,
        width: 1.5,
        margin: 0.025,
        justifyContent: "center",
        fontSize: 0.09,
    });

    title.add(
        new ThreeMeshUI.Text({
            content: "Coffee Roaster",
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

        margin: 0.025,
    });





    const subSubBlock1 = new ThreeMeshUI.Block({
        height: 0.1,
        width: 0.5,

        fontSize: 0.04,
        justifyContent: "center",
        backgroundOpacity: 0,
    }).add(
        new ThreeMeshUI.Text({
            content: "Coffee Roaster Parts",
        }),


    );





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
        width: 0.5,
        margin: 0.01,
        padding: 0.02,
        fontSize: 0.025,
        alignItems: "start",
        textAlign: 'justify',
        backgroundOpacity: 0,
    });


    subSubBlock2.onAfterUpdate = function () {
        this.frame.layers.set(count % 2);
    };


    let page1 = []
    page1[0] = "Part 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
    page1[1] = "Part 2. Something Here "
    page1[2] = "Part 3. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
    page1[3] = "Part 4. Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"


    const text = new ThreeMeshUI.Text({
        content: '1. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat',
        height: 0.8,
        width: 0.5,
        margin: 0.01,
        padding: 0.02,
        fontSize: 0.025,
        alignItems: "start",
        textAlign: 'justify',
        backgroundOpacity: 0,
    });

    const counter = new ThreeMeshUI.Text({
        content: '0',
        height: 0.8,
        width: 0.5,
        margin: 0.01,
        padding: 0.02,
        fontSize: 0.025,
        alignItems: "start",
        textAlign: 'justify',
        backgroundOpacity: 0,
    });

    subSubBlock2.add(text, counter);


    subSubBlock2.name = "subblock2";

    rightSubBlock.add(subSubBlock1, subSubBlock2);


    //

    const contentContainer = new ThreeMeshUI.Block({
        contentDirection: "row",
        padding: 0.02,
        margin: 0.025,
        backgroundOpacity: 0,
    });

    contentContainer.add(leftSubBlock, rightSubBlock);
    container1.add(contentContainer);





    new THREE.TextureLoader().load("assets/roastimg.jpg", (texture) => {
        leftSubBlock.set({
            backgroundTexture: texture,
        });
    });





    scene.add(container, container1);





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


            console.log(count)
            let caller = "page" + count.toString();
            if (count >= 0 && page1.length - 1 > count) {
                count++;
                text.set({ content: String(page1[count]) });
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


            console.log(count)
            let caller = "page" + count.toString();
            if (count >= 1 && page1.length > count) {
                count--;
                text.set({ content: String(page1[count]) });
            }

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

    ThreeMeshUI.update();

    controls.update();

    updateButtons(controller1);
    updateButtons(controller2);
    handleCollisions();
    //isVisible();
    cleanIntersected();

    intersectObjects(controller1);
    intersectObjects(controller2);

    renderer.render(scene, camera);


}


function updateButtons(controller) {

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
                setVisible();


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
function addpanel() {







    const container1 = new ThreeMeshUI.Block({
        ref: "pan",
        //justifyContent: 'center',
        //contentDirection: 'row-reverse',
        fontFamily: "assets/Roboto-msdf.json",
        fontTexture: "assets/Roboto-msdf.png",
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11
    });





    container1.position.set(2.3, 3, .1);
    container1.rotation.x = 0;
    container1.rotation.y = -1.7;

    const title = new ThreeMeshUI.Block({
        height: 0.2,
        width: 1.5,
        margin: 0.025,
        justifyContent: "center",
        fontSize: 0.09,
    });

    title.add(
        new ThreeMeshUI.Text({
            content: "Coffee Roaster",
        })
    );

    container1.add(title);


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

    const contentContainer = new ThreeMeshUI.Block({
        contentDirection: "row",
        padding: 0.02,
        margin: 0.025,
        backgroundOpacity: 0,
    });

    contentContainer.add(leftSubBlock);
    container1.add(contentContainer);





    new THREE.TextureLoader().load("assets/roast.jpg", (texture) => {
        leftSubBlock.set({
            backgroundTexture: texture,
        });
    });



    container1.visible = false;
    container1.name = "adpan";
    scene.add(container1);



}

function isVisible() {

    var object = scene.getObjectByName("adpan", true);
    object.visible = true;
    isplaying = true;
    // if(isplaying){
    //     object.visible = true;
    // }else{
    //     object.visible = false;
    // }

}


function notVisible() {

    var object = scene.getObjectByName("adpan", true);
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