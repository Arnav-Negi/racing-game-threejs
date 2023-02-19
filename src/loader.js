import {GLTFLoader} from "three/addons/loaders/GLTFLoader";

export default function gltfLoad(file) {
    return new Promise((resolve) => {
        return new GLTFLoader().load(file, resolve);
    })
}