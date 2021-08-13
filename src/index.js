import { WEBGL } from './WebGL';
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, Mesh, PointLight, Vector2, MeshBasicMaterial, Vector3, BoxGeometry, SphereGeometry, PointsMaterial, Points, BufferGeometry, BufferAttribute, Raycaster, Sphere, ArrowHelper } from 'three';
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

// global variables
let FOLLOW;
let EARTH_ANGLE;
let SOLAR_ANGLE;
const DEFAULT_CAMERA_POSITION = new Vector3(0, 0, 1000);
let CAMERA_POSITION = DEFAULT_CAMERA_POSITION;

const scene = new Scene();

document.addEventListener( 'mousemove', onMouseMove );
document.addEventListener( 'mousedown', onDocumentMouseDown );


// Camera settings
const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set( 0, 0, 1000 );
const camera_position = new Vector3( 0, 0, 1000 );
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
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.key = {
    LEFT: "ArrowLeft",
    UP: "ArrowUp",
    RIGHT: "ArrowRight",
    BOTTOM: "ArrowBottom"
}
controls.listenToKeyEvents( document );
controls.enablePan = false;

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


// mouse interactions
const raycaster = new Raycaster();
raycaster.far = 10000;
raycaster.near = 0;
raycaster.layers.enableAll();
const mouse = new Vector2();

function onMouseMove( event ) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = ( event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentMouseDown( event ) { 
    event.preventDefault();

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    // calculates  objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );

    // make intersected objects emissive
    if ( intersects.length > 0) {
        if ( intersects[ 0 ]) {
            if ( intersects[ 0 ].object && intersects[ 0 ].object.name ) {
                FOLLOW = intersects[ 0 ].object
                let offset_value;

                if ( FOLLOW.name == "planet" ) {
                    offset_value = 200;
                } else {
                    offset_value = 1000;
                }
                const offset = new Vector3( FOLLOW.position.x, FOLLOW.position.y, FOLLOW.position.z + offset_value );
                CAMERA_POSITION = offset;

            }
        } 
    } else {
        FOLLOW = sun;
        CAMERA_POSITION = DEFAULT_CAMERA_POSITION;
        controls.enabled = true;
    }
}



// Create the sun
const sun = new Mesh(new SphereGeometry(100, 100, 20), new MeshBasicMaterial({
  color: "orange",
  wireframe: false
}));
sun.position.z = -2.25;
sun.layers.enable(1);
sun.name = "sun";
console.log(sun);
scene.add(sun);

// Import the earth
const loader = new GLTFLoader();
let planet = new Mesh();
loader.load( planet_model, function( gltf ) {
    planet = gltf.scene;
    scene.add( gltf.scene );
    planet.position.set(400, 200, 0);
});
planet.name = "planet";
console.log(planet);

// Create earth colliding sphere
const earth_material = new MeshBasicMaterial({color: "white", wireframe: false});
const earth_geometry = new SphereGeometry(30, 30, 10);
const earth_colliding_sphere = new Mesh( earth_geometry, earth_material );
earth_colliding_sphere.visible = false;
earth_colliding_sphere.name = "planet";

scene.add( earth_colliding_sphere );


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
    // make camera follow selected object
    if ( FOLLOW ) {
        if ( FOLLOW.name == "planet" ) {
            // planet is followed, stop rotation around the sun
            SOLAR_ANGLE = 0;
        }else {
            SOLAR_ANGLE = 0.003;
        }
    } else {
        SOLAR_ANGLE = 0.003;
    }

    // dynamic and smooth camera positioning
    camera.position.lerp( CAMERA_POSITION, 0.03 );

    // rotate earth around the sun
    rotateAboutPoint(planet, new Vector3(0, 0, 0), new Vector3(0, 1, 1), SOLAR_ANGLE);

    // rotate the earth
    planet.rotation.x += 0.001;
    earth_colliding_sphere.position.copy( planet.position );
    earth_colliding_sphere.updateMatrixWorld();

    // rendering sun as glowing element
    renderer.autoClear = false;
    renderer.clear();

    camera.layers.set(1);
    composer.render();

    renderer.clearDepth();
    camera.layers.set(0);
    renderer.render(scene, camera);


    requestAnimationFrame(render);
}