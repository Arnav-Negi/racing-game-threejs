import * as THREE from 'three';
import {createLight, moveLight} from './lighting';
import WebGL from "three/addons/capabilities/WebGL";
import {Player, Enemy} from "./car"
import {renderMap} from './track';
import {startScreen, removeStartScreen, endScreen, displayStats, removeHUD} from "./screens";
import {doFuelCollisions, Fuel, getClosestFuel, spawnFuels} from "./fuel";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader";

let prevTimeRec = Math.floor((new Date).getTime() / 1000);
let game = {
    mapWidth: 2000,
    mapHeight: 2000,
    radius: 250,
    width: 75,
    State: 0,
    lap: 1,
    time: 0,
    view: 0
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let player = undefined;
let enemies = [];
const scene = new THREE.Scene();
const light = createLight();
scene.add(light);

// Camera 1
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.name = "Player view"
camera.position.set(0, 0, 300);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);


// Camera Top view
let insetWidth = window.innerWidth / 4;
let insetHeight = window.innerHeight / 4;

const cameraTop = new THREE.OrthographicCamera(
    -30,
    30,
    50,
    -50,
    0.1,
    1000
);
cameraTop.name = "Overhead view";
cameraTop.position.set(0, 0, 60);
cameraTop.lookAt(0, 0, 0);
cameraTop.up.set(0, 1, 0);

scene.add(camera);

function Init() {
    startScreen();
    loadAudience();
    player = new Player(-game.radius, -game.radius - game.width/4, 0, scene);
    enemies.push(new Enemy(-game.radius + 15, -game.radius - game.width/4, 1.7, scene, 1));
    enemies.push(new Enemy(-game.radius, -game.radius + game.width/4, 1.7, scene, 2));
    enemies.push(new Enemy(-game.radius + 15, -game.radius + game.width/4, 1.7, scene, 3));
    spawnFuels(scene, game.radius, game.width);
    renderMap(game.mapWidth, game.mapHeight, game.radius, game.width, scene);
    animate();
}

function moveCam() {
    let del = new THREE.Vector3(Math.cos(player.Angle), Math.sin(player.Angle), 0);

    if (game.view === 0) {
        camera.position.set(player.position.x - 7 * del.x, player.position.y - 7 * del.y, 7);
        camera.lookAt(player.position.x, player.position.y, 4);
    } else {
        camera.position.set(player.position.x, player.position.y, 4);
        camera.lookAt(player.position.x + del.x * 5, player.position.y + del.y * 5, 3);
    }

    cameraTop.position.set(player.position.x, player.position.y, 60);
    cameraTop.lookAt(player.position.x, player.position.y, 0);
}

function doWallCollision() {
    const x = player.position.x, y = player.position.y
    if (x <= -game.radius || x >= game.radius) {
        let radialVector;
        if (x <= -game.radius) radialVector = new THREE.Vector3(-game.radius, 0, 0);
        else radialVector = new THREE.Vector3(game.radius, 0, 0);

        const dist = player.position.distanceTo(radialVector);
        radialVector.sub(player.position);
        radialVector.normalize();
        if (dist > game.radius + game.width / 2 - 3) {
            console.log(player.velocity);
            // collide with outer wall
            // player.velocity.addScaledVector(radialVector, (2*radialVector.dot(player.velocity)));
            player.velocity.set(0, 0, 0);
            player.position.addScaledVector(radialVector, 1);
        }
        if (dist < game.radius - game.width / 2 + 3) {
            console.log(player.velocity);
            // collide with outer wall
            // player.velocity.addScaledVector(radialVector, (2*radialVector.dot(player.velocity)));
            player.velocity.set(0, 0, 0);
            player.position.addScaledVector(radialVector, -1);
        }
    } else {
        let radialVector, upper, lower;
        radialVector = new THREE.Vector3(0, -1, 0);
        if (y >= 0) {
            upper = game.radius + game.width / 2 - 3;
            lower = game.radius - game.width / 2 + 3;
        } else {
            upper = -game.radius + game.width / 2 - 3;
            lower = -game.radius - game.width / 2 + 3;
        }

        if (y > upper) {
            // collide with outer wall
            // player.velocity.addScaledVector(radialVector, (2*radialVector.dot(player.velocity)));
            player.velocity.set(0, 0, 0);
            player.position.addScaledVector(radialVector, 1);
        }
        if (y < lower) {
            // collide with outer wall
            // player.velocity.addScaledVector(radialVector, (2*radialVector.dot(player.velocity)));
            player.velocity.set(0, 0, 0);
            player.position.addScaledVector(radialVector, -1);
        }
    }
}

function UpdateTime() {
    const newTime = Math.floor((new Date).getTime() / 1000);
    game.time += newTime - prevTimeRec;
    prevTimeRec = newTime;
}

function calculcateRank(player, enemies) {
    let rank = 1;
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].lap >= player.lap) {
            rank += 1;
        }
    }

    return rank;
}

function loadAudience() {
    for (let i = 0; i < 10; i++) {
        (new GLTFLoader()).loadAsync("http://localhost:8080/src/audience.glb").then((res) => {
            const Mesh = res.scene;

            Mesh.scale.set(1.5,1.5, 1.5);
            Mesh.rotation.set(Math.PI/2,Math.PI/2, 0);
            Mesh.position.set(-game.radius + 5 + i*25, -game.radius - game.width/2 - 10, 1);
            scene.add(Mesh);
        }).catch(reportError => console.log(reportError));
    }

    for (let i = 0; i < 10; i++) {
        (new GLTFLoader()).loadAsync("http://localhost:8080/src/audience.glb").then((res) => {
            const Mesh = res.scene;

            Mesh.scale.set(1.5,1.5, 1.5);
            Mesh.rotation.set(Math.PI/2,3*Math.PI/2, 0);
            Mesh.position.set(-game.radius + 5 + i*25, -game.radius + game.width/2 + 10, 1);
            scene.add(Mesh);
        }).catch(reportError => console.log(reportError));
    }
}


function animate() {
    let status, newLap;
    requestAnimationFrame(animate);
    try {
        if (game.state === 1) {
            player.Move();
            for (let i = 0; i < enemies.length; i++) {
                enemies[i].UpdateStats(game.radius);
                enemies[i].Move(game.radius, game.width);
            }
        }

        moveCam();
        doWallCollision();
        doFuelCollisions(player, scene);
        player.doCollisionWithCars(enemies);
        UpdateTime();
        newLap = player.UpdateStats(game.radius);
        displayStats(player, game.time, getClosestFuel(player));
        if (game.state !== 1) removeHUD();
        if (newLap === true) {
            game.lap++;
            if (game.lap === 4) {
                // end game
                removeHUD();

                endScreen(0, calculcateRank(player, enemies));
                game.state = 2;
            }
            spawnFuels(scene, game.radius, game.width);
        }
        status = player.Check();
        if (status !== 0) {
            //find leaderboard, end game;
            removeHUD();
            endScreen(status, 0);
            game.state = 2;
        }
    } catch (e) {
        console.log(e)
    }

    // cam #1
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    // cam #2
    renderer.clearDepth();
    renderer.setScissorTest(true);

    renderer.setScissor(
        window.innerWidth - insetWidth - 16,
        window.innerHeight - insetHeight - 16,
        insetWidth,
        insetHeight
    );

    renderer.setViewport(window.innerWidth - insetWidth - 16,
        window.innerHeight - insetHeight - 16,
        insetWidth,
        insetHeight
    );

    renderer.render(scene, cameraTop);
    renderer.setScissorTest(false);
}

if (WebGL.isWebGLAvailable()) {
    // Initiate function or other initializations here
    Init();
} else {

    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);

}

let ToggleT = false;
window.addEventListener("keydown", function (event) {
    if (event.key === "w" || event.key === "W") player.accelerate = true;
    if (event.key === "s" || event.key === "S") player.decelerate = true;
    if (event.key === "d" || event.key === "D") player.turnR = true;
    if (event.key === "a" || event.key === "A") player.turnL = true;
    if (event.key === " " || event.key === "Space") {
        if (game.State === 0) {
            game.state = 1;
            removeStartScreen();
        }
    }
    if (event.key === "t" || event.key === "T") {
        ToggleT = true;
    }
})

window.addEventListener("keyup", function (event) {
    if (event.key === "w" || event.key === "W") player.accelerate = false;
    if (event.key === "s" || event.key === "S") player.decelerate = false;
    if (event.key === "d" || event.key === "D") player.turnR = false;
    if (event.key === "a" || event.key === "A") player.turnL = false;
    if (event.key === "t" || event.key === "T") {
        if (ToggleT === true) {
            ToggleT = false;
            game.view = (game.view === 1 ? 0 : 1)
        }
    }
})

window.addEventListener("resize", function (event) {
    // Cam player
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Cam top view
    insetWidth = window.innerWidth / 4;
    insetHeight = window.innerHeight / 4;
    cameraTop.aspect = insetWidth / insetHeight;
    cameraTop.updateProjectionMatrix();
})
