import {GLTFLoader} from "three/addons/loaders/GLTFLoader";
import * as THREE from 'three';

class Player {
    constructor(x, y, z, scene) {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.Angle = 0;
        this.accelerate = false;
        this.decelerate = false;
        this.turnR = false, this.turnL = false;
        this.lap = 1;
        this.distanceYet = 0;
        this.fuelUsed = 0;
        this.progressQuad = 0;
        this.position = new THREE.Vector3(x, y, z);

        this.health = 100;
        this.fuel = 100;
        this.mileage = 20;
        (new GLTFLoader()).loadAsync("http://localhost:8080/src/mcqueen/scene.gltf").then((res) => {
            this.Mesh = res.scene;

            this.Mesh.scale.set(1.1, 1.1, 1.1);
            this.Mesh.rotation.set(Math.PI / 2, Math.PI / 2, 0);
            this.Mesh.position.set(x, y, z);
            scene.add(this.Mesh);
        }).catch(reportError => console.log(reportError));
    }

    Move() {
        let turnSpeed = 0.01
        if (this.turnL === true) {
            this.Angle += turnSpeed;
            this.Mesh.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), turnSpeed);
        }
        if (this.turnR === true) {
            this.Angle -= turnSpeed;
            this.Mesh.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -turnSpeed);
        }
        let deltaV = 0
        if (this.accelerate === true) {
            deltaV = 1
            this.fuel -= 0.05;
            this.fuelUsed += 0.05;
        }
        if (this.decelerate === true) {
            deltaV = -1
        }
        if (this.velocity.length() + 0.1 * deltaV - 0.05 >= 0)
            this.velocity = new THREE.Vector3(Math.cos(this.Angle), Math.sin(this.Angle), 0).multiplyScalar(this.velocity.length() + 0.1 * deltaV - 0.05);
        else
            this.velocity.set(0,0,0);
        this.Mesh.position.addScaledVector(this.velocity, 0.1);
        this.distanceYet += this.velocity.length()*0.1;
        this.position = this.Mesh.position;
    }

    Check() {
        console.log(this.fuel)
        if (this.health <= 0 || this.fuel <= 0) {
            return 1;
        }

        return 0;
    }

    UpdateStats(radius) {
        let x = this.position.x, y = this.position.y, newLap = false;

        if (x >= radius) {
            if (this.progressQuad === 0) this.progressQuad = 1
        } else if (x > -radius) {
            if (y > 0 && this.progressQuad === 1) this.progressQuad = 2;
            else if (this.progressQuad === 3) {
                this.progressQuad = 0;
                this.lap++;
                newLap = true;
            }
        } else {
            if (this.progressQuad === 2) this.progressQuad = 3;
        }
        return newLap;
    }
}

class Enemy {
    constructor(x,y,z,scene,variant) {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.Angle = 0;
        this.lap = 1;
        this.progressQuad = 0;
        this.position = new THREE.Vector3(x, y, z);

        this.variant = variant;

        (new GLTFLoader()).loadAsync("http://localhost:8080/src/enemy_car/scene.gltf").then((res) => {
            this.Mesh = res.scene;

            this.Mesh.scale.set(2.2, 2.2, 2.2);
            this.Mesh.rotation.set(Math.PI / 2, Math.PI / 2, 0);
            this.Mesh.position.set(x, y, z);
            scene.add(this.Mesh);
        }).catch(reportError => console.log(reportError));
    }

    Move() {
        if (this.lap === 4) return;
        if (this.variant === 1) {

        }
        if (this.variant === 2) {

        }
        if (this.variant === 3) {

        }
    }

    UpdateStats(radius, trackWidth) {
        let x = this.position.x, y = this.position.y

        if (x >= radius) {
            if (this.progressQuad === 0) this.progressQuad = 1
        } else if (x > -radius) {
            if (y > 0 && this.progressQuad === 1) this.progressQuad = 2;
            else if (this.progressQuad === 3) {
                this.progressQuad = 0;
                this.lap++;
            }
        } else {
            if (this.progressQuad === 2) this.progressQuad = 3;
        }
    }
}

export {Player, Enemy};