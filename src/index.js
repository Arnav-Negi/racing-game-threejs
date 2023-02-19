import * as THREE from 'three';
import {createLight, moveLight} from './lighting';
import WebGL from "three/addons/capabilities/WebGL";
import Player from "./car"
import {renderMap} from './track';
import {CSS2DObject, CSS2DRenderer} from "three/addons/renderers/CSS2DRenderer";

let game =  {
    mapWidth: 1000,
    mapHeight: 1000,
    radius: 125,
    width: 90,
    State: 0
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let player = undefined;
const scene = new THREE.Scene();
const light = createLight();
scene.add(light);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0,0,300);
camera.up.set(0,0,1);
camera.lookAt(0,0,0);
scene.add(camera);

// let HUDrenderer = new CSS2DRenderer();
//
// // Set the size of the renderer to match the size of the window
// HUDrenderer.setSize(window.innerWidth, window.innerHeight);
// HUDrenderer.domElement.style.position = 'absolute';
// HUDrenderer.domElement.style.top = '0px';
// HUDrenderer.domElement.style.pointerEvents = 'none';
// // Add the renderer to the document
// document.body.appendChild(HUDrenderer.domElement);
//
// const p = document.createElement("text");
// p.style.color = 'black'
// p.textContent = 'Text'
// const pLabel = new CSS2DObject(p);
// pLabel.position.set(0,0,0);
// scene.add(pLabel);

function Init() {
    player = new Player(-game.radius, -game.radius, 1, scene);
    renderMap(game.mapWidth, game.mapHeight, game.radius, game.width, scene);
    animate();
}

function moveCam() { //TODO look in car direction
    let del = new THREE.Vector3(Math.cos(player.Angle), Math.sin(player.Angle), 0);

    camera.position.set(player.position.x - 5*del.x, player.position.y - 5*del.y , 7);
    // camera.position.set(player.position.x - 5, player.position.y, 5 )
}

function doWallCollision()
{
    const x = player.position.x, y = player.position.y
    if (x <= -game.radius || x >= game.radius) {
        let radialVector;
        if (x <= -game.radius) radialVector = new THREE.Vector3(-game.radius, 0, 0);
        else radialVector = new THREE.Vector3(game.radius, 0, 0);

        const dist = player.position.distanceTo(radialVector);
        radialVector.sub(player.position);
        radialVector.normalize();
        if (dist > game.radius + game.width/2 - 3) {
            console.log(player.velocity);
            // collide with outer wall
            // player.velocity.addScaledVector(radialVector, (2*radialVector.dot(player.velocity)));
            player.velocity.set(0,0,0);
            player.position.addScaledVector(radialVector, 1);
        }
        if (dist < game.radius - game.width/2 + 3) {
            console.log(player.velocity);
            // collide with outer wall
            // player.velocity.addScaledVector(radialVector, (2*radialVector.dot(player.velocity)));
            player.velocity.set(0,0,0);
            player.position.addScaledVector(radialVector, -1);
        }
    }
    else {
        let radialVector, upper, lower;
        radialVector = new THREE.Vector3(0, -1, 0);
        if (y >= 0) {
            upper = game.radius + game.width/2 - 3;
            lower = game.radius - game.width/2 + 3;
        }
        else {
            upper = -game.radius + game.width/2 - 3;
            lower = -game.radius - game.width/2 + 3;
        }

        if (y > upper) {
            // collide with outer wall
            // player.velocity.addScaledVector(radialVector, (2*radialVector.dot(player.velocity)));
            player.velocity.set(0,0,0);
            player.position.addScaledVector(radialVector, 1);
        }
        if (y < lower) {
            // collide with outer wall
            // player.velocity.addScaledVector(radialVector, (2*radialVector.dot(player.velocity)));
            player.velocity.set(0,0,0);
            player.position.addScaledVector(radialVector, -1);
        }
    }
}


function animate() {
    requestAnimationFrame(animate);
    try {
        player.Move();
        moveCam();
        // camera.position.set(player.position add(new THREE.Vector3(0, 0, 20)));
        camera.lookAt(player.position.x,  player.position.y,  4);
        doWallCollision();
    }
    catch (e) {console.log(e)};
    renderer.render(scene,  camera);
    // HUDrenderer.render(scene, camera);
}

if (WebGL.isWebGLAvailable()) {
    // Initiate function or other initializations here
    Init();
} else {

    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);

}

window.addEventListener("keydown", function (event) {
    if (event.key === "w" || event.key === "W") player.accelerate = true;
    if (event.key === "s" || event.key === "S") player.decelerate = true;
    if (event.key === "d" || event.key === "D") player.turnR = true;
    if (event.key === "a" || event.key === "A") player.turnL = true;
    if (event.key === " " || event.key === "Space") {
        if (game.State === 0) game.state = 1;
    }

    if (event.key === "r" || event.key === "R") player.Reset();
})

window.addEventListener("keyup", function (event) {
    if (event.key === "w" || event.key === "W") player.accelerate = false;
    if (event.key === "s" || event.key === "S") player.decelerate = false;
    if (event.key === "d" || event.key === "D") player.turnR = false;
    if (event.key === "a" || event.key === "A") player.turnL = false;
    if (event.key === "r" || event.key === "R") player.Reset();
})

window.addEventListener("resize", function (event) {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // HUDrenderer.setSize(this.window.innerWidth, this.window.innerHeight);
})
