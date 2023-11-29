import * as THREE from '/js/threejs/three.module.js';
import { ColladaLoader } from '/js/threejs/loaders/ColladaLoader.js';
import { OrbitControls } from '/js/threejs/controls/OrbitControls.js';

var container, clock, controls;
var camera, scene, renderer, mixer, animations, avatar, sphere;

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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    var gridHelper = new THREE.GridHelper(10, 20);
    scene.add(gridHelper);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    scene.add(camera);
    camera.add(pointLight);

    const geometry = new THREE.SphereGeometry(15, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.z = 5;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controls.target.set(0, 2, 0);
    controls.update();  

    animate();
}

function AddEarthquake() {
    const geometry = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    sphere = new THREE.Mesh(geometry, material); scene.add(sphere);
}

/*window.ThreeJSFunctions = {
    load: () => { loadScene(); },
    stop: () => { onStop(); },
    start: () => { onStart(); },
};*/

window.EarthquakeVisualizerJS = {
    load: () => { loadScene(); },
    addEarthquake: () => { AddEarthquake(); }
};

window.onload = loadScene;