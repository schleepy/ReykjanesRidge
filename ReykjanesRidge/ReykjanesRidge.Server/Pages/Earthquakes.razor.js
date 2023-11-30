import * as THREE from '/js/threejs/three.module.js';
import { ColladaLoader } from '/js/threejs/loaders/ColladaLoader.js';
import { OrbitControls } from '/js/threejs/controls/OrbitControls.js';

var container, clock, controls;
var camera, scene, renderer, mixer, animations, avatar;

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

    var gridHelper = new THREE.GridHelper(100, 200);
    scene.add(gridHelper);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    scene.add(camera);
    camera.add(pointLight);

    camera.position.z = 5;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.minDistance = 5;
    controls.maxDistance = 500;
    controls.target.set(0, 2, 0);
    controls.update();  

    animate();
}

function AddEarthquake(earthquake) {
    var magnitudeColor = new THREE.Color('rgb(0, 255, 0)');
    var magnitude = earthquake["magnitude"];
    if (magnitude > 1) {
        magnitudeColor = new THREE.Color('rgb(255, 255, 0)');
    } else if (magnitude > 2) {
        magnitudeColor = new THREE.Color('rgb(255, 0, 0)');
    }
    let geometry = new THREE.SphereGeometry(earthquake["magnitude"], 32, 10);
    let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    let sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.setX(Math.floor(Math.random() * 30));
    sphere.position.setY(Math.floor(Math.random() * 30));
    sphere.position.setZ(Math.floor(Math.random() * 30));
    sphere.material.color.set(magnitudeColor);

    console.log("added earthquake" + magnitude);
}

/*window.ThreeJSFunctions = {
    load: () => { loadScene(); },
    stop: () => { onStop(); },
    start: () => { onStart(); },
};*/

window.EarthquakeVisualizerJS = {
    load: () => { loadScene(); },
    addEarthquake: (earthquake) => { AddEarthquake(earthquake); }
};

//window.onload = loadScene;