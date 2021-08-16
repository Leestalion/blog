import { PerspectiveCamera, Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Camera settings
const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set( 0, 0, 1000 );
camera.lookAt( 0, 0, 0);
camera.layers.enable(1);

// Scene
const scene = new Scene();

// GLTF loader
const loader = new GLTFLoader();

export { camera, scene, loader };