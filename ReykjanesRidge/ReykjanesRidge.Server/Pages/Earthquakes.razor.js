import * as THREE from '/js/threejs/three.module.js';
import { OrbitControls } from '/js/threejs/controls/OrbitControls.js';
import { FBXLoader } from '/js/threejs/loaders/FBXLoader.js';
import { CSS2DRenderer } from '/js/threejs/renderers/CSS2DRenderer.js';
import { Interaction } from '/js/threejs/interaction/src/three.interaction.js'; // Add on from from jasonChen1982 on github, thank you!

var container = document.getElementById('threejscontainer');
var clock, controls;
var camera, scene, renderer, mixer, animations, iceland, interaction;
var earthquakes = [];

$(document).ready(function () {

    $(window).resize(function () {

        if (renderer == null || camera == null)
            return;

        var box = container.getBoundingClientRect();
        renderer.setSize(window.innerWidth, window.innerHeight);

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix()
    });
});

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
    fbxLoader.load('/models/iceland_flat_svg.fbx', function (object) {
            object.scale.set(.4, .4, .4)
            object.position.setX(36);
            object.position.setZ(-20);
            object.rotation.y = (-22.7 * (Math.PI / 180))
            context.add(object)
            object.traverse(function (child) {
                if (child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x262626,
                        emissive: 0x262626,
                        opacity: 0.1
                    });
                }
            })
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

    // interaction
    interaction = new Interaction(renderer, scene, camera);

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

function AddEarthquake(earthquake, visible = true)
{
    if (Array.isArray(earthquake)) { // recursively add earthquakes if multiple are being added by a single websocket call
        for (var i = 0; i < earthquake.length; i++) {
            AddEarthquake(earthquake[i], visible);
        }
        return;
    }

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

    sphere.material.color.set(magnitudeColor);
    sphere.material.emissive.set(magnitudeColor);
    sphere.material.transparent = true;
    sphere.material.opacity = 0.6;

    var earthquakeGroup = new THREE.Group();

    earthquakeGroup.position.copy(position);
    earthquakeGroup.position.setY(-(earthquake["depth"])); // Set depth
    earthquakeGroup.add(sphere);
    earthquakeGroup.visible = visible;

    var surface = earthquake["depth"] + (Math.random() * 0.3);

    // draw line reaching the surface from the epicenter
    var points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, surface, 0)];
    var line = DrawLine(points);
    line.material.color.set(magnitudeColor);
    line.material.emissive.set(magnitudeColor);
    line.material.transparent = true;
    line.material.opacity = 0.2;
    earthquakeGroup.add(line);

    // draw circle on surface
    var circle = DrawCircle(earthquake["magnitude"]/2);
    circle.rotation.x = -(Math.PI / 2);
    circle.position.setY(surface);
    circle.material.color.set(magnitudeColor);
    circle.material.emissive.set(magnitudeColor);
    circle.material.transparent = true;
    circle.material.opacity = 0.2;
    earthquakeGroup.add(circle);

    iceland.add(earthquakeGroup);

    // Interaction
    earthquakeGroup.cursor = 'pointer';

    // hover over
    earthquakeGroup.on('mouseover', (ev) => FocusEarthquake(ev));

    // hover out
    earthquakeGroup.on('mouseout', (ev) => UnfocusEarthquake(ev));

    // click on earthquake group
    earthquakeGroup.on('click', function (ev) {
        // focus target
        controls.target.copy(ev.data.target.position);
    });

    earthquakes[earthquake["id"]] = earthquakeGroup.id;
}

function FocusEarthquake(event)
{
    var target = event.data.target;

    // get original color of children
    target.userData["originalColor"] = target.children[0].material.color;
    target.userData["originalScale"] = target.scale;

    // set hover color on all children
    /*for (var i = 0; i < children.length; i++) {
        console.log("setting color on children");
        children[i].material.color.set("rgb(255, 0, 0)");
        children[i].material.emissive.set("rgb(255, 0, 0)");
    };*/

    // scale up
    target.scale.setX(1.1);
    target.scale.setY(1.1);
    target.scale.setZ(1.1);
}
function UnfocusEarthquake(event) {
    var target = event.data.target;

    // set hover color on all children to their original;
    /*for (var i = 0; i < children.length; i++) {
        console.log("setting original color on children");
        children[i].material.color = (target.userData["originalColor"]);
        children[i].material.emissive = (target.userData["originalColor"]);
    };*/

    // scale to original
    target.scale.setX(1);
    target.scale.setY(1);
    target.scale.setZ(1);
}

function DrawLine(points)
{
    var material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var line = new THREE.Line(geometry, material);
    return line;
}

function DrawCircle(radius, segments = 32)
{
    var geometry = new THREE.CircleGeometry(radius, 32);
    var material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    var circle = new THREE.Mesh(geometry, material);
    return circle;
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
    addEarthquake:    (earthquake, visible) => { AddEarthquake(earthquake, visible); },
    //removeEarthquake: (id) => { removeEarthquake(id); },
    showEarthquake:   (ids) => { showEarthquake(ids); },
    hideEarthquake:   (ids) => { hideEarthquake(ids); },
    setCameraPos:     (x, y, z) => { setCameraPosition(x, y, z) },
    toggleSidebar:    () => { toggleSidebar(); }
};

function hideEarthquake(ids)
{
    if (Array.isArray(ids)) {
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var object = scene.getObjectById(earthquakes[id], true);
            object.visible = false;
        }
    }
    else { // get single and hide it
        var object = scene.getObjectById(earthquakes[ids], true);
        object.visible = false;
    }
}

function showEarthquake(ids)
{
    if (Array.isArray(ids)) {
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var object = scene.getObjectById(earthquakes[id], true);
            object.visible = true;
        }
    }
    else { // get single and hide it
        var object = scene.getObjectById(earthquakes[ids], true);
        object.visible = true;
    }
}
    
function toggleSidebar() {
    $(".ui.sidebar").sidebar({transition: 'overlay'});
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