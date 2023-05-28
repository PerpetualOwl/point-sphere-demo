import * as THREE from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set( 0, 800, 0 );

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#canvas"),
    alpha: true
});

renderer.setClearColor( 0x000000, 0 );

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', onWindowResize, false);

var distance = Math.min(200, window.innerWidth / 4);
const material = new THREE.MeshBasicMaterial( { color: 0xffffff} );
//const red_material = new THREE.MeshBasicMaterial( { color: 0x880808} );
material.sizeAttenuation = true;

var points = [];
var numpoints = 2000;

for (var i = 0; i < numpoints; i++) {
    var geometry = new THREE.SphereGeometry( Math.abs(THREE.MathUtils.randFloatSpread(4)), 8, 8); 
    
    var theta = THREE.MathUtils.randFloatSpread(360);
    var phi = Math.acos(1 - (2 * Math.abs(THREE.MathUtils.randFloatSpread(2))));

    if (i < 5) {
        theta = i * 30;
        //phi = 80;
        geometry = new THREE.SphereGeometry( 4, 8, 8 );
    }

    var particle = new THREE.Mesh(geometry, material);

    /*if (i == 0) {
        particle = new THREE.Mesh(geometry, red_material);
    }*/

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

var tag = document.getElementsByClassName("tag");
function get_coords() {
    var distances = []
    for (var i = 0; i < 5; i++) {
        let pos = new THREE.Vector3();
        pos = pos.setFromMatrixPosition(points[i]["point"].matrixWorld);
        pos.project(camera);
        let widthHalf = window.innerWidth / 2;
        let heightHalf = window.innerHeight / 2;
        pos.x = (pos.x * widthHalf) + widthHalf;
        pos.y = - (pos.y * heightHalf) + heightHalf;
        pos.z = 0;

        tag[i].style.top = (pos.y).toString() + "px";
        tag[i].style.left = (pos.x).toString() + "px";
        distances.push(camera.position.distanceTo(pos));
        tag[i].style.opacity = ".4";
        tag[i].style.zIndex = "0";
    }

    console.log(distances);

    var closest_point = distances.indexOf(Math.min(...distances));
    tag[closest_point].style.opacity = "1";
    tag[closest_point].style.zIndex = "100";
    var furthest_point = distances.indexOf(Math.max(...distances));
    tag[furthest_point].style.opacity = "0";
}


function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
    rotation += 0.002;
    if (rotation > 360) {
        rotation = 0;
    }
    recalculate_particles();

    get_coords();
}

animate();