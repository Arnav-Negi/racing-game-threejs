import * as THREE from 'three';

function createLine(x){
    const material = new THREE.LineBasicMaterial({color: 0x0000ff});

    const points = [];
    points.push( new THREE.Vector3( - x, 0, 0 ) );
    points.push( new THREE.Vector3( 0, x, 0 ) );
    points.push( new THREE.Vector3( x, 0, 0 ) );

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);

    return line;
}

export {createLine};