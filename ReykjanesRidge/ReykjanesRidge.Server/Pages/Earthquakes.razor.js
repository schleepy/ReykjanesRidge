import * as THREE from '/js/threejs/three.module.js';
import { OrbitControls } from '/js/threejs/controls/OrbitControls.js';
import { FBXLoader } from '/js/threejs/loaders/FBXLoader.js';
import {
    CSS2DRenderer,
    CSS2DObject
} from '/js/threejs/renderers/CSS2DRenderer.js';
import { Interaction } from '/js/threejs/interaction/src/three.interaction.js'; // Add on from from jasonChen1982 on github, thank you!
import { EffectComposer } from '/js/threejs/postprocessing/EffectComposer.js';
import { RenderPass } from '/js/threejs/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '/js/threejs/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from '/js/threejs/postprocessing/ShaderPass.js';
import { FXAAShader } from '/js/threejs/postprocessing/shaders/FXAAShader.js';

var container = document.getElementById('threejscontainer');
var clock, controls;
var composer, camera, scene, renderScene, bloomPass, renderer, labelRenderer, mixer, animations, iceland, interaction;
var earthquakes = [];
var dotNetReference;
var earthquakeInfos = [];
var earthquakeEpicenters = [];

const params = {
    exposure: 1,
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: 0
};

$(document).ready(function () {

    $(window).resize(function () {

        if (renderer == null || camera == null)
            return;

        var box = container.getBoundingClientRect();
        renderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);

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
    //renderer.render(scene, camera);
    composer.render();
    labelRenderer.render(scene, camera);
    // make epicenters look at camera
    /*for (var x = 0; x < Object.values(earthquakes).length; x++)
    {
        var earthquakeGroupId = Object.values(earthquakes)[x];
        var earthquakeGroup = scene.getObjectById(earthquakeGroupId);

        if (!earthquakeGroup)
        {
            continue;
        }

        // skip invisible groups
        if (earthquakeGroup.visible == false)
        {
            continue;
        }

        for (var y = 0; y < earthquakeGroup.children.length; y++) {

            if (earthquakeGroup.children[y].userData["type"] == "epicenter")
            {
                //earthquakeGroup.children[y].lookAt(camera.position);
            }
        }
    }*/
}

function render() {
    var delta = clock.getDelta();
    if (mixer !== undefined) {
        mixer.update(delta);
    }
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

/**
 * Loads an FBX model asynchronously
 * @param {string} path path to model
 * @param {string} context which context to add object to, scene, group, etc.
 */

function loadFBX(path, context) {
    const fbxLoader = new FBXLoader()
    fbxLoader.load(path, function (object) {
            object.scale.set(.4, .4, .4)
            object.position.setX(36);
            object.position.setZ(-20);
            object.rotation.y = (-22.7 * (Math.PI / 180))
            context.add(object)
            object.traverse(function (child) {
                if (child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x346beb,
                        emissive: 0x346beb,
                        opacity: 1,
                        side: THREE.DoubleSide
                    });
                }
            })
        }
    );
}

// Load initial scene and populate with earthquakes
function loadScene(dotNetRef) {

    dotNetReference = dotNetRef;

    if (!container) {
        return;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.copy(cameraStartingPos); // Set camera starting pos

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;

    renderScene = new RenderPass(scene, camera);

    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    effectFXAA.renderToScreen = true;

    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(effectFXAA);
    composer.addPass(bloomPass);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';

    // interaction
    interaction = new Interaction(labelRenderer, scene, camera);

    container.appendChild(renderer.domElement);
    container.appendChild(labelRenderer.domElement);

    iceland = new THREE.Group();

    var icelandModel = loadFBX('/models/iceland_flat_edges_svg.fbx', iceland);

    scene.add(iceland);

    /*var gridHelper = new THREE.GridHelper(100, 2);
    scene.add(gridHelper);*/

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    scene.add(camera);
    camera.add(pointLight);

    controls = new OrbitControls(camera, labelRenderer.domElement);
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

    //var geometry = new THREE.SphereGeometry(magnitude/2, 16, 14);
    //var material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    //var sphere = new THREE.Mesh(geometry, material);

    // Get X and Y position from longitude and latitude
    var position = GCStoCartesian(earthquake["latitude"], earthquake["longitude"]);

    // create earthquakegroup
    var earthquakeGroup = new THREE.Group();

    earthquakeGroup.position.copy(position);
    earthquakeGroup.position.setY(-(earthquake["depth"])); // Set depth
    earthquakeGroup.visible = visible;

    // change sphere to circle to save some FPS
    /*var epicenterCircle = DrawCircle(earthquake["magnitude"]/2, 16);
    epicenterCircle.material.color.set(magnitudeColor);
    epicenterCircle.material.emissive.set(magnitudeColor);
    epicenterCircle.material.transparent = true;
    epicenterCircle.material.opacity = 0.6;
    epicenterCircle.userData["type"] = "epicenter";*/

    var spriteMaterial = new THREE.SpriteMaterial({
        program: function (context) {
            context.beginPath();
            context.arc(0, 0, 2, 0, Math.PI * 2, true);
            context.fill();
        }
    });

    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.material.color = magnitudeColor;
    sprite.scale.set(magnitude/2, magnitude/2, magnitude/2)

    earthquakeGroup.add(sprite);

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
    circle.material.opacity = 0.5;
    earthquakeGroup.add(circle);
    earthquakeGroup.layers.set(1);

    iceland.add(earthquakeGroup);

    // Interaction
    earthquakeGroup.cursor = 'pointer';

    // hover over
    earthquakeGroup.on('mouseover', (ev) => FocusEarthquake(ev));
    // hover out
    earthquakeGroup.on('mouseout', (ev) => UnfocusEarthquake(ev));

    // click on earthquake group
    earthquakeGroup.on('click', function (ev) {

        for (var i = 0; i < earthquakeInfos.length; i++) {
            iceland.remove(earthquakeInfos[i]);
        }
        earthquakeInfos = [];

        DisplayEarthquakeInfo(ev.data.target);

        // focus target
        controls.target.copy(ev.data.target.position);
    });

    earthquakes[earthquake["id"]] = earthquakeGroup.id;
}
function AddLocation(location)
{
    if (Array.isArray(location)) {
        for (var i = 0; i < location.length; i++) {
            AddLocation(location[i]);
        }
        return;
    }

    var locationTagDiv = document.createElement('div');
    locationTagDiv.textContent = location["name"];
    locationTagDiv.style.backgroundColor = 'transparent';
    locationTagDiv.style.color = 'rgb(255, 255, 255)';
    locationTagDiv.style.fontSize = (location["fontSize"]).toString() + "px";

    var position = GCStoCartesian(location["latitude"], location["longitude"]);

    var locationTagLabel = new CSS2DObject(locationTagDiv);
    locationTagLabel.position.copy(position);
    locationTagLabel.position.setY(3.5);
    locationTagLabel.center.set(0, 0);
    locationTagLabel.layers.set(0);
    iceland.add(locationTagLabel);
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

function DisplayEarthquakeInfo(target) {

    var earthquakeId = getKeyByValue(earthquakes, target.id);

    dotNetReference.invokeMethodAsync('getEarthquake', earthquakeId)
        .then(earthquake => {

            var earthquakeInfoDiv = document.createElement('div');
            earthquakeInfoDiv.className = "earthquakeInfo";

            var earthquakeInfoTable = document.createElement('table');
            earthquakeInfoTable.className = "earthquakeInfo";
            earthquakeInfoDiv.append(earthquakeInfoTable);

            var timeStampRow = earthquakeInfoTable.insertRow(0);
            timeStampRow.insertCell(0).innerHTML = "Timestamp";
            timeStampRow.insertCell(1).innerHTML = earthquake["timeStamp"];

            var locationRow = earthquakeInfoTable.insertRow(1);
            locationRow.insertCell(0).innerHTML = "Location";
            locationRow.insertCell(1).innerHTML = earthquake["friendlyLocation"];

            var magnitudeRow = earthquakeInfoTable.insertRow(2);
            magnitudeRow.insertCell(0).innerHTML = "Magnitude";
            magnitudeRow.insertCell(1).innerHTML = earthquake["magnitude"];

            var latitudeRow = earthquakeInfoTable.insertRow(3);
            latitudeRow.insertCell(0).innerHTML = "Latitude";
            latitudeRow.insertCell(1).innerHTML = earthquake["latitude"];

            var longitudeRow = earthquakeInfoTable.insertRow(4);
            longitudeRow.insertCell(0).innerHTML = "Longitude";
            longitudeRow.insertCell(1).innerHTML = earthquake["longitude"];

            var depthRow = earthquakeInfoTable.insertRow(5);
            depthRow.insertCell(0).innerHTML = "Depth";
            depthRow.insertCell(1).innerHTML = earthquake["depth"];

            var earthquakeInfo = new CSS2DObject(earthquakeInfoDiv);
            earthquakeInfo.position.copy(target.position);
            earthquakeInfo.center.set(0, 0);
            iceland.add(earthquakeInfo);
            earthquakeInfos.push(earthquakeInfo);
        });
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
        x = (-((radius) * Math.sin(phi) * Math.cos(theta))) - 2530,
        z = ((radius) * Math.sin(phi) * Math.sin(theta)) - 900,
        y = 0;

    return new THREE.Vector3(x, y, z);
}

window.EarthquakeVisualizerJS = {
    load:             (dotNetRef) => { loadScene(dotNetRef); },
    addEarthquake:    (earthquake, visible) => { AddEarthquake(earthquake, visible); },
    addLocation:      (location) => { AddLocation(location); },
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