import { WEBGL } from './WebGL';
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, Mesh, PointLight, Vector2, MeshBasicMaterial, Vector3, BoxGeometry, SphereGeometry, PointsMaterial, Points, BufferGeometry, BufferAttribute } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import './style.css';
import { rotateAboutPoint, getRandomParticlePos } from './utils.js';
import planet_model from './3Dmodels/planet.glb';


const scene = new Scene();


// Camera settings
const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set( 0, 0, 1000 );
camera.lookAt( 0, 0, 0);
camera.layers.enable(1);

// WebGL renderer
const renderer = new WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x020202);
document.body.appendChild(renderer.domElement);

// controls
new OrbitControls(camera, renderer.domElement);

// light
const light = new PointLight(0xffffff, 2, 0, 2);
light.position.set(0, 0, 0);
scene.add(light);
scene.add(new AmbientLight(0xffffff, 0.1));


// stars background
const geometry = new BufferGeometry();
geometry.setAttribute(
    "position",
    new BufferAttribute(getRandomParticlePos(10000), 3)
)

const material = new PointsMaterial( { 
    size: 2,
    transparent: true,
    color: 0xffffff
} );
const stars = new Points( geometry, material );
stars.scale.setScalar(500);

scene.add( stars );

let mouseX = 0;
let mouseY = 0;
document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
})





// Create the sun
const objBack = new Mesh(new SphereGeometry(100, 100, 20), new MeshBasicMaterial({
  color: "orange",
  wireframe: false
}));
objBack.position.z = -2.25;
objBack.layers.enable(1);
scene.add(objBack);

// Import the earth
const loader = new GLTFLoader();
let planet = new Mesh();
loader.load( planet_model, function( gltf ) {
    planet = gltf.scene;
    scene.add( gltf.scene );
    planet.position.set(400, 200, 0);
});

/** COMPOSER */
const renderScene = new RenderPass(scene, camera)

const effectFXAA = new ShaderPass(FXAAShader)
effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)

const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
bloomPass.threshold = 0.21
bloomPass.strength = 1.2
bloomPass.radius = 1
bloomPass.renderToScreen = true

const composer = new EffectComposer(renderer)
composer.setSize(window.innerWidth, window.innerHeight)

composer.addPass(renderScene)
composer.addPass(effectFXAA)
composer.addPass(bloomPass)

renderer.gammaInput = true
renderer.gammaOutput = true
renderer.toneMappingExposure = Math.pow(0.9, 4.0)



// webGL compaptibility checking
if ( WEBGL.isWebGLAvailable() ) {

    render();

} else {

	const warning = WEBGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );

}


// render function
function render() {
    requestAnimationFrame(render);

    rotateAboutPoint(planet, new Vector3(0, 0, 0), new Vector3(0, 1, 1), 0.001);

    planet.rotation.x += 0.001;

    renderer.autoClear = false;
    renderer.clear();

    camera.layers.set(1);
    composer.render();

    renderer.clearDepth();
    camera.layers.set(0);
    renderer.render(scene, camera);
}