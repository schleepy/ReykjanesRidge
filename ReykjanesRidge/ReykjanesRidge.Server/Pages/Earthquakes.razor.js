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

    let geometry = new THREE.SphereGeometry(100, 32, 32);
    let material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    let sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

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
    var magnitude = earthquake["magnitude"] / 10;
    if (magnitude > 1) {
        magnitudeColor = new THREE.Color('rgb(255, 255, 0)');
    } else if (magnitude > 2) {
        magnitudeColor = new THREE.Color('rgb(255, 0, 0)');
    }
    let geometry = new THREE.SphereGeometry(magnitude, 32, 10);
    let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    let sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    var position = convertcoords(earthquake["latitude"], earthquake["longitude"]);
    console.log(position);
    //sphere.position.set(position);
    sphere.position.setX(position.x);
    sphere.position.setY(position.y);
    sphere.position.setZ(position.z);
    /*sphere.position.setX(Math.floor(Math.random() * 30));
    sphere.position.setY(Math.floor(Math.random() * 30));
    sphere.position.setZ(Math.floor(Math.random() * 30));*/
    sphere.material.color.set(magnitudeColor);

    console.log("added earthquake" + magnitude);
}

function convertcoords(lat, lon) {
    var radius = 100;
    var phi = (90 - lat) * (Math.PI / 180),
        theta = (lon + 180) * (Math.PI / 180),
        x = -((radius) * Math.sin(phi) * Math.cos(theta)),
        z = ((radius) * Math.sin(phi) * Math.sin(theta)),
        y = ((radius) * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
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