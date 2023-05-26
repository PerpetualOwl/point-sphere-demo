import * as THREE from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set( 0, 400, 400 );

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#canvas"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', onWindowResize, false);

var distance = Math.min(200, window.innerWidth / 4);
const material = new THREE.MeshBasicMaterial( { color: 0xffffff} );

var points = [];
var numpoints = 2000;

for (var i = 0; i < numpoints; i++) {
    var geometry = new THREE.SphereGeometry( Math.abs(THREE.MathUtils.randFloatSpread(2)), 8, 8 ); 
    var particle = new THREE.Mesh(geometry, material);
    var theta = THREE.MathUtils.randFloatSpread(360);
    var phi = Math.acos(1 - (2 * Math.abs(THREE.MathUtils.randFloatSpread(2))));
    particle.position.x = distance * Math.sin(phi) * Math.cos(theta);
    particle.position.y = distance * Math.sin(phi) * Math.sin(theta);
    particle.position.z = distance * Math.cos(phi);
    var offset = THREE.MathUtils.randFloatSpread(360);
    var amplitude = THREE.MathUtils.randFloatSpread(distance / 10);
    var point = {point: particle, rho: distance, theta: theta, phi: phi, offset: offset, amplitude: amplitude};
    points.push(point);
    scene.add(point["point"]);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

const controls = new OrbitControls( camera, renderer.domElement );

var rotation = 0;

function recalculate_particles() {
    for (var i = 0; i < numpoints; i++) {
        point = points[i];
        var distance = point["rho"] + point["amplitude"] * Math.sin(rotation * 25 + point["offset"]);
        var x = distance * Math.sin(point["phi"]) * Math.cos(point["theta"] + rotation);
        var y = distance * Math.sin(point["phi"]) * Math.sin(point["theta"] + rotation);
        var z = distance * Math.cos(point["phi"]);
        point["point"].position.set(x, y, z);
    }
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
    rotation += 0.002;
    if (rotation > 360) {
        rotation = 0;
    }
    recalculate_particles();
}

animate();