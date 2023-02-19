import {GLTFLoader} from "three/addons/loaders/GLTFLoader";
import * as THREE from 'three';

export default class Player {
    constructor(x, y, z, scene) {
        this.velocity = new THREE.Vector3(0,0,0);
        this.Angle = 0;
        this.accelerate = false;
        this.decelerate = false;
        this.turnR = false, this.turnL = false;
        this.lap = 1;
        this.progressQuad = 0;
        this.position = new THREE.Vector3(x, y ,z);

        this.health = 100;
        this.fuel = 100;
        this.mileage = 10;
        (new GLTFLoader()).loadAsync("http://localhost:8080/src/mcqueen/scene.gltf").then((res)=>{
            this.Mesh = res.scene;

            this.Mesh.scale.set(1,1,1);
            this.Mesh.rotation.set(Math.PI/2,Math.PI/2,0);
            this.Mesh.position.set(x,y,z);
            scene.add(this.Mesh);
        }).catch(reportError =>console.log(reportError));
    }

    Move() {
        let turnSpeed = 0.01
        if (this.turnL === true) {
            this.Angle += turnSpeed;
            this.Mesh.rotateOnWorldAxis(new THREE.Vector3(0,0,1), turnSpeed);
        }
        if (this.turnR === true) {
            this.Angle -= turnSpeed;
            this.Mesh.rotateOnWorldAxis(new THREE.Vector3(0,0,1), -turnSpeed);
        }
        let deltaV = 0
        if (this.accelerate === true) {
            deltaV = 1
        }
        if (this.decelerate === true) {
            deltaV = -1
        }
        this.velocity = new THREE.Vector3(Math.cos(this.Angle),Math.sin(this.Angle),0).multiplyScalar(this.velocity.length() + 0.08*deltaV - 0.04);
        this.Mesh.position.addScaledVector(this.velocity, 0.1);
        this.position = this.Mesh.position;

        this.fuel -= (this.velocity.length()/this.mileage)*0.1;
    }

    Check() {
        console.log(this.fuel)
        if (this.health <=  0 || this.fuel <= 0) {
            return 1;
        }

        return 0;
    }

    UpdateStats(radius, trackWidth) {
        let x = this.position.x, y = this.position.y, newLap = false;

        if (x >= radius) {
            if (this.progressQuad === 0) this.progressQuad = 1
        }
        else if (x > -radius) {
            if (y > 0 && this.progressQuad === 1) this.progressQuad = 2;
            else if (this.progressQuad === 3) {
                this.progressQuad = 0;
                this.lap++;
                newLap = true;
            }
        }
        else {
            if (this.progressQuad === 2) this.progressQuad = 3;
        }
        return newLap;
    }
}

class