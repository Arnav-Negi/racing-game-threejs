import {GLTFLoader} from "three/addons/loaders/GLTFLoader";
import * as THREE from 'three';
import {OBB} from 'three/addons/math/OBB.js';

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
        this.invinciblityTime = 0, this.lastCollision = -1;

        this.health = 100;
        this.fuel = 100;
        this.mileage = 20;
        (new GLTFLoader()).loadAsync("http://localhost:8080/src/mcqueen/scene.gltf").then((res) => {
            this.Mesh = res.scene;

            this.Mesh.scale.set(1.1, 1.1, 1.1);
            this.Mesh.rotation.set(Math.PI / 2, Math.PI / 2, 0);
            this.Mesh.position.set(x, y, z);

            const box3obj = new THREE.Box3().setFromObject(this.Mesh);
            this.Box = new OBB().fromBox3(box3obj);

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
            this.velocity.set(0, 0, 0);
        this.Mesh.position.addScaledVector(this.velocity, 0.1);
        this.distanceYet += this.velocity.length() * 0.1;
        this.position = this.Mesh.position;
    }

    Check() {
        if (this.health <= 0) return 1;

        if (this.fuel <= 0) return 2;

        return 0;
    }

    UpdateStats(radius) {
        if (this.invinciblityTime > 0) {
            const time = new Date().getTime()/1000
            this.invinciblityTime -= (time - this.lastCollision);
            console.log(this.invinciblityTime);
            this.lastCollision = time;
        }
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

    doCollisionWithCars(enemies) {
        let box3obj = new THREE.Box3().setFromObject(this.Mesh);
        this.Box = new OBB().fromBox3(box3obj);
        if (this.invinciblityTime > 0) return;
        for (let i = 0; i < enemies.length; i++) {
            box3obj = new THREE.Box3().setFromObject(enemies[i].Mesh);
            enemies[i].Box = new OBB().fromBox3(box3obj);
            if (this.Box.intersectsOBB(enemies[i].Box)) {
                console.log("collision");
                this.health -= 20;
                enemies[i].health -= 20;
                this.velocity.multiplyScalar(-1 / (this.velocity.length() * 5));
                let tempV = new THREE.Vector3().copy(enemies[i].position);
                tempV.sub(this.position);
                let Dot = tempV.dot(new THREE.Vector3(Math.cos(this.Angle), Math.sin(this.Angle), 0));
                if (Dot >= 0)
                    this.position.sub(new THREE.Vector3(Math.cos(this.Angle), Math.sin(this.Angle), 0));
                else
                    this.position.add(new THREE.Vector3(Math.cos(this.Angle), Math.sin(this.Angle), 0));
                this.invinciblityTime = 2;
                this.lastCollision = new Date().getTime()/1000;
                return;
            }
        }
    }
}

class Enemy {
    constructor(x, y, z, scene, variant) {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.Angle = 0;
        this.lap = 1;
        this.progressQuad = 0;
        this.position = new THREE.Vector3(x, y, z);
        this.lastFrameQuad = 3;
        this.turnL = 0, this.turnR = 0;

        this.variant = variant;

        (new GLTFLoader()).loadAsync("http://localhost:8080/src/enemy_car/scene.gltf").then((res) => {
            this.Mesh = res.scene;

            this.Mesh.scale.set(2.2, 2.2, 2.2);
            this.Mesh.rotation.set(Math.PI / 2, Math.PI / 2, 0);
            this.Mesh.position.set(x, y, z);


            scene.add(this.Mesh);
        }).catch(reportError => console.log(reportError));
    }

    Move(radius, trackWidth) {
        let baseSpeed = 1.15;
        if (this.lap === 4) return;
        let x = this.position.x, y = this.position.y;
        let normalVector = new THREE.Vector3(0, 0, 0), speed = 0, angle;
        if (this.progressQuad === 0) normalVector.set(1, 0, 0);
        else if (this.progressQuad === 2) normalVector.set(-1, 0, 0);
        else if (this.progressQuad === 1) {
            normalVector.copy(this.position);
            normalVector.sub(new THREE.Vector3(radius, 0, 0));
            normalVector.cross(new THREE.Vector3(0, 0, -1));
            normalVector.normalize();
        } else if (this.progressQuad === 3) {
            normalVector.copy(this.position);
            normalVector.sub(new THREE.Vector3(-radius, 0, 0));
            normalVector.cross(new THREE.Vector3(0, 0, -1));
            normalVector.normalize();
        }

        if (this.variant === 1) {
            speed = baseSpeed * 1.25;
        }
        if (this.variant === 2) {
            if (this.progressQuad === 1 || this.progressQuad === 3) speed = baseSpeed * 2.5;
            else speed = baseSpeed * 0.75;
        }
        if (this.variant === 3) {
            if (this.progressQuad === 0) {
                if (y >= -radius + trackWidth / 4 || this.lastFrameQuad === 3 || (this.turnR && y > -radius - trackWidth / 4)) {
                    normalVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 4);
                    this.Mesh.rotation.set(Math.PI / 2, 3 * Math.PI / 4, 0);
                    this.Angle = -Math.PI / 4;
                    this.lastFrameQuad = 0;
                    this.turnR = 1;
                    this.turnL = 0;
                } else {
                    normalVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 4);
                    this.Mesh.rotation.set(Math.PI / 2, 3 * Math.PI / 4, 0);
                    this.Angle = Math.PI / 4;
                    this.turnR = 0;
                    this.turnL = 1;
                }
                speed = baseSpeed * 1.5;
            } else if (this.progressQuad === 2) {
                if (y >= radius + trackWidth / 4 || this.lastFrameQuad === 1 || (this.turnL && y > radius - trackWidth / 4)) {
                    normalVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 4);
                    this.Mesh.rotation.set(Math.PI / 2, Math.PI / 4, 0);
                    this.Angle = -3 * Math.PI / 4;
                    this.turnR = 0;
                    this.turnL = 1;
                    this.lastFrameQuad = 2
                } else {
                    normalVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 4);
                    this.Mesh.rotation.set(Math.PI / 2, Math.PI / 4, 0);
                    this.Angle = 3 * Math.PI / 4;
                    this.turnR = 1;
                    this.turnL = 0;
                }
                speed = baseSpeed * 1.5;
            } else {
                if (this.lastFrameQuad === 0) {
                    this.lastFrameQuad = 1;
                    this.Mesh.rotation.set(Math.PI / 2, Math.PI / 2, 0);
                }
                if (this.lastFrameQuad === 2) {
                    this.lastFrameQuad = 3;
                    this.Mesh.rotation.set(Math.PI / 2, -Math.PI / 2, 0);
                }
                speed = baseSpeed * 1.5;
            }
        }

        this.position.addScaledVector(normalVector, speed);

        if (this.progressQuad === 1 || this.progressQuad === 3) {
            angle = speed / radius;
            this.Mesh.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), angle);
        }
        this.Mesh.position.copy(this.position);
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