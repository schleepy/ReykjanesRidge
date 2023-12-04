import * as THREE from '/js/threejs/three.module.js';
import { ColladaLoader } from '/js/threejs/loaders/ColladaLoader.js';
import { OrbitControls } from '/js/threejs/controls/OrbitControls.js';
import { FBXLoader } from '/js/threejs/loaders/FBXLoader.js';

var container, clock, controls;
var camera, scene, renderer, mixer, animations, avatar;

const cameraStartingPos = new THREE.Vector3(357, 388, 113);
const cameraStartingFocusPoint = new THREE.Vector3(30, -50, -20);

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

function render() {
    var delta = clock.getDelta();
    if (mixer !== undefined) {
        mixer.update(delta);
    }
    renderer.render(scene, camera);
}

// Load initial scene and populate with earthquakes
function loadScene() {

    container = document.getElementById('threejscontainer');
    if (!container) {
        return;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.copy(cameraStartingPos); // Set camera starting pos

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // FBX Loader
    const fbxLoader = new FBXLoader()
    fbxLoader.load(
        '/models/iceland_flat_svg.fbx',
        (object) => {
            object.scale.set(.4, .4, .4)
            //object.position.setY(-1)
            object.position.setX(36);
            object.position.setZ(-20);
            object.rotation.y = (-22.7 * (Math.PI / 180))
            scene.add(object)
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }
    )

    /*var gridHelper = new THREE.GridHelper(100, 2);
    scene.add(gridHelper);*/

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    scene.add(camera);
    camera.add(pointLight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 3000;
    controls.target.copy(cameraStartingFocusPoint);
    controls.update();  

    animate();
}

function AddEarthquake(earthquake) {

    var magnitudeColor = new THREE.Color('rgb(0, 255, 0)');

    var magnitude = earthquake["magnitude"] / 2;

    if (magnitude > 1) {

        magnitudeColor = new THREE.Color('rgb(255, 255, 0)');

    } else if (magnitude > 2) {

        magnitudeColor = new THREE.Color('rgb(255, 0, 0)');

    }

    let geometry = new THREE.SphereGeometry(magnitude, 32, 10);
    let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    let sphere = new THREE.Mesh(geometry, material);

    scene.add(sphere);

    // Get X and Y position from longitude and latitude
    var position = convertcoords(earthquake["latitude"], earthquake["longitude"]);

    // Offset, fix this later
    position.x -= 2530; 
    position.z -= 900;

    sphere.position.setX(position.x);
    sphere.position.setZ(position.z);

    sphere.position.setY(-(earthquake["depth"])); // Set depth

    sphere.material.color.set(magnitudeColor);

    console.log("added earthquake" + magnitude);
}

function convertcoords(lat, lon) {
    var radius = 6371; // Radius of the earth in kilometers
    var phi = (90 - lat) * (Math.PI / 180),
        theta = (lon + 180) * (Math.PI / 180),
        x = -((radius) * Math.sin(phi) * Math.cos(theta)),
        z = ((radius) * Math.sin(phi) * Math.sin(theta)),
        y = ((radius) * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
}

window.EarthquakeVisualizerJS = {
    load: () => { loadScene(); },
    addEarthquake: (earthquake) => { AddEarthquake(earthquake); }
};

function Debug() {
    if (camera != null) {
        console.log("camera position: ");
        console.log(camera.position);
    }
    setTimeout(Debug, 5000);
}

Debug();