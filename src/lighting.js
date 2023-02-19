import * as THREE from 'three';

function createLight(Position = {x:0, y:100, z:100}) {
  const color = 0xFFFFFF;
  const intensity = 0.5;
  const light = new THREE.AmbientLight(color, intensity);
  light.position.set(Position.x, Position.y, Position.z);
  return light;
}

function moveLight(light){
    light.position.x += 1;
    if(light.position.x > 100){
        light.position.x = -100;
    }
}


export {createLight,moveLight};