import * as THREE from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Papa from 'papaparse';

var numtags = 0;
var tags = [];

const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoW-UgmqklRfBQ6CyALrvWRPsqtQhSmSva21vC6rRwJgOrXgcr9fHqTcqiQjnQnSUQx0HVbJX36pPt/pub?gid=0&single=true&output=csv';

const container = document.getElementById("container");

fetch(csvUrl)
  .then(response => response.text())
  .then(csvData => {
    const parsedData = Papa.parse(csvData, { header: true });
    const jsonData = parsedData.data; // Parsed CSV data as a JSON array

    // Use the jsonData variable as needed
    numtags = jsonData.length;
    
    for (var i = 0; i < numtags; i++) {
        //add to DOM all these tags, and then append it to tags variable
        var tag = document.createElement("div");
        tag.className = "tag";
        var heading = document.createElement("h3");
        heading.innerText = jsonData[i]["question"];
        var section = document.createElement("div");
        section.className = "section";
        var p = document.createElement("p");
        p.className = jsonData[i]["color1"];
        p.innerText = jsonData[i]["answer1"]
        var image = document.createElement("img");
        image.src = jsonData[i]["image1"];
        image.className = "img";
        section.appendChild(p);
        section.appendChild(image);
        tag.appendChild(heading);
        tag.appendChild(section);
        if (jsonData[i]["answer2"] != "blank") {
            var section2 = document.createElement("div");
            section2.className = "section";
            var p2 = document.createElement("p");
            p2.className = jsonData[i]["color2"];
            p2.innerText = jsonData[i]["answer2"]
            p2.style.paddingTop = "0";
            var image2 = document.createElement("img");
            image2.src = jsonData[i]["image2"];
            image2.className = "img";
            section2.appendChild(p2);
            section2.appendChild(image2);
            tag.appendChild(section2);
        }
        container.appendChild(tag);

        tags.push(tag);
    }
})
  .catch(error => {
    console.error('Error:', error);
});





const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set( 0, 700, 0 );

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
material.sizeAttenuation = true;

var points = [];
var numpoints = 2000;

for (var i = 0; i < numpoints; i++) {
    var geometry = new THREE.SphereGeometry( Math.abs(THREE.MathUtils.randFloatSpread(4)), 8, 8); 
    
    var theta = THREE.MathUtils.randFloatSpread(360);
    var phi = Math.acos(1 - (2 * Math.abs(THREE.MathUtils.randFloatSpread(2))));

    if (i < numtags) {
        theta = i * 30;
        //phi = 80;
        geometry = new THREE.SphereGeometry( 4, 8, 8 );
    }

    var particle = new THREE.Mesh(geometry, material);

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

var end_time = 0;
var position_top = 0;
var position_left = 0;
var last_chosen = 0;
var chosen_index = -1;
var mvmt_x = 0;
var mvmt_y = 0;

function get_coords() {
    for (var i = 0; i < numtags; i++) {
        let pos = new THREE.Vector3();
        pos = pos.setFromMatrixPosition(points[i]["point"].matrixWorld);
        pos.project(camera);
        pos.x = (pos.x * window.innerWidth / 2) + window.innerWidth / 2;
        pos.y = - (pos.y * window.innerHeight / 2) + window.innerHeight / 2;
        pos.z = 0;

        const { top, right, bottom, left } = tags[i].getBoundingClientRect();
        if (top < 0) {
            pos.y = 0
        }
        if (bottom > window.innerHeight) {
            pos.y -= bottom - window.innerHeight;
        }
        if (left < 0) {
            pos.x = 0
        }
        if (right > window.innerWidth) {
            pos.x -= right - window.innerWidth;
        }
        if (i != chosen_index) {
            tags[i].style.top = (pos.y).toString() + "px";
            tags[i].style.left = (pos.x).toString() + "px";
            tags[i].style.opacity = ".4";
            tags[i].style.scale = "1";
            tags[i].style.zIndex = "0";
        } else {
            mvmt_x = pos.x;
            mvmt_y = pos.y;
        }
    }
}

function tag_highlighting() {
    var tag = tags[chosen_index];
    tag.style.zIndex = "99";
    if (end_time - Date.now() > 4000) {
        // move to position
        var sinusoidal = Math.cos(Math.PI * (Date.now() - end_time + 6000) / 1000) / 2 + 0.5;
        tag.style.scale = (1 + .4 * sinusoidal).toString();
        tag.style.opacity = (0.4 + 0.6 * sinusoidal).toString();
        tag.style.top = (mvmt_y * (1 - sinusoidal) + position_top * sinusoidal).toString() + "px";
        tag.style.left = (mvmt_x * (1 - sinusoidal) + position_left * sinusoidal).toString() + "px";

    } else if (end_time - Date.now() > 1000) {
        // stay in position
        tag.style.scale = "1.4";
        tag.style.opacity = "1";
        tag.style.top = position_top.toString() + "px";
        tag.style.left = position_left.toString() + "px";
    } else if (end_time - Date.now() > 0) {
        // move back
        var sinusoidal = 1 - (Math.cos(Math.PI * (Date.now() - end_time + 2000) / 1000) / 2 + 0.5);
        tag.style.scale = (1 + .4 * sinusoidal).toString();
        tag.style.opacity = (0.4 + 0.6 * sinusoidal).toString();
        tag.style.top = (mvmt_y * (1 - sinusoidal) + position_top * sinusoidal).toString() + "px";
        tag.style.left = (mvmt_x * (1 - sinusoidal) + position_left * sinusoidal).toString() + "px";

    }
}

function restart_animation() {
    chosen_index = Math.floor(Math.random() * (numtags - 1));
    if (chosen_index <= last_chosen) {
        chosen_index++;
    }
    last_chosen = chosen_index;
    end_time = Date.now() + 5000; // 5 second cycle: 1 out, 3 stay, 1 down
    position_top = (Math.random() + 0.1) / 1.8 * window.innerHeight;
    position_left = (Math.random() + 0.1) / 1.6 * window.innerWidth;
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
    if (numtags > 0) {
        if (end_time <= Date.now()) {
            restart_animation();
        }
        tag_highlighting();
    }

}

animate();