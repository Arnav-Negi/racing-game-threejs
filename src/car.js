import {GLTFLoader} from "three/addons/loaders/GLTFLoader";
import * as THREE from 'three';

export default class Player {
    constructor(x, y, z, scene) {
        this.velocity = new THREE.Vector3(0,0,0);
        this.Angle = 0;
        this.accelerate = false;
        this.decelerate = false;
        this.turnR = false, this.turnL = false;
        this.position = new THREE.Vector3(x, y ,z);
        (new GLTFLoader()).loadAsync("http://localhost:8080/src/car-LQ/scene.gltf").then((res)=>{
            this.Mesh = res.scene;

            this.Mesh.scale.set(2,2,2);
            this.Mesh.rotation.set(Math.PI/2,Math.PI/2, 0)
            this.Mesh.position.set(x,y,z);
            this.defaultPos = [x, y, z];
            scene.add(this.Mesh);
        }).catch(reportError =>console.log(reportError));
    }

    Move() { // TODO collision with wall
        if (this.turnL === true) {
            this.Angle += 0.03;
            this.Mesh.rotateOnWorldAxis(new THREE.Vector3(0,0,1), 0.03);
        }
        if (this.turnR === true) {
            this.Angle -= 0.03;
            this.Mesh.rotateOnWorldAxis(new THREE.Vector3(0,0,1), -0.03);
        }
        let deltaV = 0
        if (this.accelerate === true) {
            deltaV = 1
        }
        if (this.decelerate === true) {
            deltaV = -1
        }
        console.log(this.accelerate, this.decelerate);
        this.velocity = new THREE.Vector3(Math.cos(this.Angle),Math.sin(this.Angle),0).multiplyScalar(this.velocity.length() + 0.7*deltaV - 0.2);
        this.Mesh.position.addScaledVector(this.velocity, 0.1);
        this.position = this.Mesh.position;
    }

    Reset() {
        this.Mesh.position.set(...this.defaultPos);
    }
}