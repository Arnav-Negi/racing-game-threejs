import * as THREE from 'three';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader";

let fuelCans = [];
let fuelVal = 20;

class Fuel {
    constructor(x, y, z, scene) {
        (new GLTFLoader()).loadAsync("http://localhost:8080/src/fuel/scene.gltf").then((res) => {
            this.Mesh = res.scene;
            this.Mesh.rotation.set(Math.PI/2,0,0)
            this.Mesh.scale.set(2, 2, 2);
            this.Mesh.position.set(x, y, z);
            scene.add(this.Mesh);
        }).catch(reportError => console.log(reportError));
        this.isDestroyed = false;
    }

    destroy(scene) {
        this.isDestroyed = true;
        scene.remove(this.Mesh);
    }
}

function doFuelCollisions(player, scene)
{
    for (let i = 0; i<fuelCans.length; i++) {
        if (fuelCans[i].Mesh.position.distanceTo(player.position) < 3 && !fuelCans[i].isDestroyed) {
            fuelCans[i].destroy(scene);
            player.fuel += fuelVal;
        }
    }
}

function spawnFuels(scene, radius, trackWidth) {
    let x, y, a;
    for (let i = 0; i<fuelCans.length; i++) {
        if (!fuelCans[i].isDestroyed) {
            fuelCans[i].destroy(scene);
        }
    }
    fuelCans = [];
    for (let quadrant = 0; quadrant < 4; quadrant++) {
        for (let numCans = 0; numCans < 2; numCans++) {
            if (quadrant === 0) {
                x = Math.random() * 2 * radius - radius;
                y = -Math.random() * trackWidth - radius + trackWidth / 2;
            } else if (quadrant === 1) {
                a = Math.random() * Math.PI - Math.PI / 2;
                x = radius + radius * Math.cos(a);
                y = radius * Math.sin(a);
            } else if (quadrant === 2) {
                x = Math.random() * 2 * radius - radius;
                y = Math.random() * trackWidth + radius - trackWidth / 2;
            } else if (quadrant === 3) {
                a = Math.random() * Math.PI - Math.PI / 2;
                x = -radius - radius * Math.cos(a);
                y = radius * Math.sin(a);
            }
            fuelCans.push(new Fuel(x, y, 1, scene));
        }
    }

}

function getClosestFuel(player) {
    let minDist = 999999, thisDist;
    for (let i = 0; i < fuelCans.length; i++) {
        if (fuelCans[i].isDestroyed) continue;
        thisDist = player.position.distanceTo(fuelCans[i].Mesh.position);
        if (thisDist < minDist) {
            minDist = thisDist;
        }
    }

    return minDist;
}

export {Fuel, spawnFuels, getClosestFuel, doFuelCollisions};