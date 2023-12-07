import * as THREE from '/js/threejs/three.module.js';
import { ColladaLoader } from '/js/threejs/loaders/ColladaLoader.js';
import { OrbitControls } from '/js/threejs/controls/OrbitControls.js';
import { FBXLoader } from '/js/threejs/loaders/FBXLoader.js';

var container = document.getElementById('threejscontainer');
var clock, controls;
var camera, scene, renderer, mixer, animations, iceland;
var earthquakes = [];

$(document).ready(function () {

    $(window).resize(function () {

        if (renderer == null || camera == null)
            return;

        var box = container.getBoundingClientRect();
        renderer.setSize(window.innerWidth, window.innerHeight);

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix()
        console.log("reeesiiizing");
    });
});

/*document.addEventListener('resize', onContainerResize);

function onContainerResize() {
    var box = container.getBoundingClientRect();
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()
    console.log("reeesiiizing");
    // optional animate/renderloop call put here for render-on-changes
}*/

const earthRadius = 6371; // radius of earth in kilometers, needed for GCS to cartesian conversion
const cameraStartingPos = new THREE.Vector3(357, 388, 113);
const cameraStartingFocusPoint = new THREE.Vector3(30, -50, -20);
const magnitudeColors = [ // colors based on magnitude, magnitude is floored and used as key
    "rgb(255, 255, 255)",
    "rgb(0, 255, 0)",
    "rgb(255, 255, 0)",
    "rgb(255, 0, 0)"
];

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

/**
 * Loads an FBX model asynchronously
 * @param {string} path path to model
 * @param {string} context which context to add object to, scene, group, etc.
 */

function loadFBX(path, context) {
    const fbxLoader = new FBXLoader()
    fbxLoader.load(
        '/models/iceland_flat_svg.fbx',
        (object) => {
            object.scale.set(.4, .4, .4)
            //object.position.setY(-1)
            object.position.setX(36);
            object.position.setZ(-20);
            object.rotation.y = (-22.7 * (Math.PI / 180))
            let material = new THREE.MeshStandardMaterial({ color: 0xffffff });
            context.add(object)
        }
    );
}

// Load initial scene and populate with earthquakes
function loadScene() {

    if (!container) {
        return;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.copy(cameraStartingPos); // Set camera starting pos

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    iceland = new THREE.Group();

    var icelandModel = loadFBX('/models/iceland_flat_svg.fbx', iceland);

    scene.add(iceland);

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

    if (iceland == null)
        return

    var magnitude = earthquake["magnitude"];
    var magnitudeColor = new THREE.Color(magnitudeColors[Math.floor(magnitude)]);

    var geometry = new THREE.SphereGeometry(magnitude/2, 32, 10);
    var material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var sphere = new THREE.Mesh(geometry, material);

    // Get X and Y position from longitude and latitude
    var position = GCStoCartesian(earthquake["latitude"], earthquake["longitude"]);

    // Offset, fix this later
    position.x -= 2530; 
    position.z -= 900;

    sphere.position.copy(position);

    sphere.position.setY(-(earthquake["depth"])); // Set depth

    sphere.material.color.set(magnitudeColor);
    sphere.material.emissive.set(magnitudeColor);
    sphere.material.transparent = true;
    sphere.material.opacity = 0.6;

    iceland.add(sphere);

    earthquakes[earthquake["id"]] = sphere.id;

    console.log("added earthquake" + sphere.name);
}

/*
    GCS coordinates to Cartesian coordinate conversion
*/
function GCStoCartesian(lat, lon, radius = earthRadius) {
    var phi = (90 - lat) * (Math.PI / 180),
        theta = (lon + 180) * (Math.PI / 180),
        x = -((radius) * Math.sin(phi) * Math.cos(theta)),
        z = ((radius) * Math.sin(phi) * Math.sin(theta)),
        y = ((radius) * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
}

window.EarthquakeVisualizerJS = {
    load:             () => { loadScene(); },
    addEarthquake:    (earthquake) => { AddEarthquake(earthquake); },
    //removeEarthquake: (id) => { removeEarthquake(id); },
    showEarthquake:   (id) => { showEarthquake(id); },
    hideEarthquake:   (id) => { hideEarthquake(id); },
    setCameraPos:     (x, y, z) => { setCameraPosition(x, y, z) },
    toggleSidebar:    () => { toggleSidebar(); }
};

function hideEarthquake(id)
{
    var object = scene.getObjectById(earthquakes[id], true);
    object.visible = false;
    console.log("hiding " + id);
}

function showEarthquake(id)
{
    var object = scene.getObjectById(earthquakes[id], true);
    object.visible = true;
    console.log("showing " + id);
}

function toggleSidebar() {
    //$('.ui.sidebar').sidebar('setting', 'dimPage', false);
    $('.ui.sidebar')
        .sidebar('toggle');
}

function Debug() {
    if (camera != null) {
        console.log("camera position: ");
        console.log(camera.position);
    }
    setTimeout(Debug, 5000);
}

function setCameraPosition(x, y, z)
{
    if (camera == null)
        return;

    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
}

Debug();