import * as THREE from 'three';

function getIsland(trackRadius, trackWidth) {
    const Island = new THREE.Shape();

    Island.absarc(
        trackRadius,
        0,
        trackRadius - trackWidth / 2,
        Math.PI / 2,
        3 * Math.PI / 2,
        true
    );
    Island.lineTo(-trackRadius, -trackRadius + trackWidth / 2);
    Island.absarc(
        -trackRadius,
        0,
        trackRadius - trackWidth / 2,
        3 * Math.PI / 2,
        Math.PI / 2,
        true
    );
    Island.lineTo(trackRadius, trackRadius - trackWidth / 2);

    return Island;
}

function getOuterField(mapWidth, mapHeight, trackRadius, trackWidth) {
    const OuterField = new THREE.Shape();

    OuterField.moveTo(-mapWidth / 2, -mapHeight / 2);
    OuterField.lineTo(0, -mapHeight / 2);
    OuterField.lineTo(0, -trackRadius - trackWidth / 2);
    OuterField.lineTo(-trackRadius, -trackRadius - trackWidth / 2);
    OuterField.absarc(
        -trackRadius,
        0,
        trackRadius + trackWidth / 2,
        -Math.PI / 2,
        Math.PI / 2,
        true
    );
    OuterField.lineTo(trackRadius, trackRadius + trackWidth / 2);
    OuterField.absarc(
        trackRadius,
        0,
        trackRadius + trackWidth / 2,
        Math.PI / 2,
        -Math.PI / 2,
        true
    )
    OuterField.lineTo(0, -trackRadius - trackWidth / 2);
    OuterField.lineTo(0, -mapHeight / 2);

    OuterField.lineTo(mapWidth / 2, -mapHeight / 2);
    OuterField.lineTo(mapWidth / 2, mapHeight / 2);
    OuterField.lineTo(-mapWidth / 2, mapHeight / 2);
    OuterField.lineTo(-mapWidth / 2, -mapHeight / 2);

    return OuterField;
}

function getLineDashes(mapWidth, mapHeight, trackRadius) {
    const canvas = document.createElement('canvas');
    canvas.height = mapHeight;
    canvas.width = mapWidth;

    const context = canvas.getContext('2d');

    context.fillStyle = "#546E90";
    context.fillRect(0, 0, mapWidth, mapHeight);

    context.lineWidth = 1;
    context.strokeStyle = '#E0FFFF';
    context.setLineDash([10, 14]);

    // left semi
    context.beginPath();
    context.arc(
        mapWidth/2 - trackRadius,
        mapHeight/2,
        trackRadius,
        Math.PI / 2,
        3 * Math.PI / 2,
        false
    );
    context.stroke();

    // right semi
    context.beginPath();
    context.arc(
        mapWidth/2 + trackRadius,
        mapHeight/2,
        trackRadius,
        Math.PI / 2,
        3 * Math.PI / 2,
        true
    );
    context.stroke();

    context.beginPath();
    context.moveTo(mapWidth/2-trackRadius, mapHeight/2 - trackRadius);
    context.lineTo(mapWidth/2+trackRadius, mapHeight/2 - trackRadius)
    context.stroke();
    context.beginPath();
    context.moveTo(mapWidth/2+trackRadius, mapHeight/2 + trackRadius);
    context.lineTo(mapWidth/2-trackRadius, mapHeight/2 + trackRadius)
    context.stroke();
    return new THREE.CanvasTexture(canvas);
}

export function renderMap(mapWidth, mapHeight, trackRadius, trackWidth, scene) {
    const lineMarkings = getLineDashes(mapWidth, mapHeight, trackRadius);

    const planeGeometry = new THREE.PlaneBufferGeometry(mapWidth, mapHeight);
    const planeMaterial = new THREE.MeshBasicMaterial({
        map: lineMarkings
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    const Island = getIsland(trackRadius, trackWidth);
    const OuterField = getOuterField(mapWidth, mapHeight, trackRadius, trackWidth);

    const FieldGeometry = new THREE.ExtrudeBufferGeometry(
        [Island, OuterField],
        {depth: 1.5, bevelEnabled: false}
    );

    const FieldMesh = new THREE.Mesh(
        FieldGeometry,
        new THREE.MeshBasicMaterial({color: 0x67c240})
    );

    scene.add(FieldMesh);
}
