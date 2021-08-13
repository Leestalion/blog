import { WEBGL } from './WebGL';
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, Mesh, PointLight, Vector2, MeshBasicMaterial, Vector3, BoxGeometry, SphereGeometry, PointsMaterial, Points, BufferGeometry, BufferAttribute, Raycaster, Sphere, ArrowHelper, MOUSE, Matrix4 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import './style.css';
import { rotateAboutPoint, getRandomParticlePos } from './utils.js';
import earth_model from './3Dmodels/earth.glb';
import mars_model from './3Dmodels/mars.glb';

// global variables
let FOLLOW;
let EARTH_SOLAR_ANGLE_SPEED;
let MARS_SOLAR_ANGLE_SPEED;
const DEFAULT_CAMERA_POSITION = new Vector3(0, 0, 1500);
let CAMERA_POSITION = DEFAULT_CAMERA_POSITION;
let MOUSE_DOWN = 0;
let EARTH_ROTATE = new Vector2(0, 0);

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let mouseXOnMouseDown = 0;
let mouseYOnMouseDown = 0;

let earthTargetRotationX = 0.0005;
let earthTargetRotationY = 0.0005;

let marsTargetRotationX = 0.0005;
let marsTargetRotationY = 0.0005;

let slowingFactor = 0.25;

const scene = new Scene();

document.addEventListener( 'mousemove', onMouseMove );
document.addEventListener( 'mousedown', onMouseDown );
document.addEventListener( 'mouseup', onMouseUp );
document.addEventListener( 'wheel', onMouseWheel );


// Camera settings
const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set( 0, 0, 1000 );
camera.lookAt( 0, 0, 0);
camera.layers.enable(1);


// zoom functions
function onMouseWheel( event ) {
    const dist_max = 3000;
    let dist_min = 300;
    const zoomOut = 1;
    const zoomIn = -1;
    let distance = 0;

    const delta = Math.sign( event.deltaY );

    if ( FOLLOW ) {
        distance = FOLLOW.position.distanceTo(CAMERA_POSITION)
        switch( FOLLOW.name ) {
            case 'earth':
                dist_min = 100;
                break;
            case 'mars':
                dist_min = 80;
                break;
            default:
                dist_min = 300;
                break;
        }
    }
    
    if ( (distance <= dist_max || delta == zoomIn) && (distance >= dist_min || delta == zoomOut) ) {
        CAMERA_POSITION.z += delta * distance/20;
    }
}

// WebGL renderer
const renderer = new WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x020202);
document.body.appendChild(renderer.domElement);

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

    raycaster.setFromCamera( mouse, camera );

    // calculates  objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );

    // mouve planet
    let mouseX = event.clientX - windowHalfX;
    let mouseY = event.clientY - windowHalfY;

    if ( FOLLOW && intersects.length > 0 && intersects[ 0 ].object && intersects[ 0 ].object.name && MOUSE_DOWN == 1 ) {
        switch( FOLLOW.name ) {
            case 'earth':
                earthTargetRotationX = ( mouseX - mouseXOnMouseDown ) * 0.0005;
                earthTargetRotationY = ( mouseY - mouseYOnMouseDown ) * 0.0005;
                break;
            case 'mars':
                marsTargetRotationX = ( mouseX - mouseXOnMouseDown ) * 0.0005;
                marsTargetRotationY = ( mouseY - mouseYOnMouseDown ) * 0.0005;
                break;
        }
    }

}

function onMouseDown( event ) { 
    event.preventDefault();

    ++MOUSE_DOWN;
    mouseXOnMouseDown = event.clientX - windowHalfX;
    mouseYOnMouseDown = event.clientY - windowHalfY;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    // calculates  objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );

    // make intersected objects emissive
    if ( intersects.length > 0) {
        if ( intersects[ 0 ].object && intersects[ 0 ].object.name ) {
            FOLLOW = intersects[ 0 ].object
            let offset_value;
            removeCloseButtons();
            addCloseButton();

            switch( FOLLOW.name ) {
                case 'earth':
                    offset_value = 200;
                    break;
                case 'mars':
                    offset_value = 150;
                    break;
                default: 
                    offset_value = 1000;
                    break;
            }
            const offset = new Vector3( FOLLOW.position.x, FOLLOW.position.y, FOLLOW.position.z + offset_value );
            CAMERA_POSITION = offset;
        }
    }
}

function onMouseUp() {
    --MOUSE_DOWN;
}

function addCloseButton() {
    let leaveDiv = document.createElement('button');
    leaveDiv.innerHTML = "x";
    leaveDiv.classList.add("close");
    leaveDiv.addEventListener("click", function() {
        removeCloseButtons();
        FOLLOW = null;
        CAMERA_POSITION = DEFAULT_CAMERA_POSITION;
    });
    document.body.appendChild(leaveDiv);
}

function removeCloseButtons() {
    let toDelete = document.body.getElementsByClassName("close");
    if ( toDelete.length > 0 ) {
        for ( let i = 0; i <= toDelete.length; i ++ ) {
            document.body.removeChild( toDelete[ i ] );
        }
    }
}

// Create the sun
const sun = new Mesh(new SphereGeometry(100, 100, 20), new MeshBasicMaterial({
  color: "orange",
  wireframe: false
}));
sun.layers.enable(1);
sun.name = "sun";
scene.add(sun);

// Import the earth
const loader = new GLTFLoader();
let earth = new Mesh();
loader.load( earth_model, function( gltf ) {
    earth = gltf.scene;
    scene.add( gltf.scene );
    earth.position.set(400, 200, 0);
});
earth.name = "earth";

// Create earth colliding sphere
const collider_material = new MeshBasicMaterial({color: "white", wireframe: false});
const collider_geometry = new SphereGeometry(30, 30, 10);
const earth_colliding_sphere = new Mesh( collider_geometry, collider_material );
earth_colliding_sphere.visible = false;
earth_colliding_sphere.name = "earth";

scene.add( earth_colliding_sphere );

// Import mars
let mars = new Mesh();
loader.load( mars_model, function( gltf ) {
    mars = gltf.scene;
    //mars.scale.set(3, 3, 3);
    scene.add( gltf.scene );
    mars.position.set(600, 300, 0);
})
mars.name = "mars";
console.log(mars);

// Create mars colliding sphere
const mars_collider_geometry = new SphereGeometry(18, 18, 10);
const mars_colliding_sphere = new Mesh( mars_collider_geometry, collider_material );
mars_colliding_sphere.visible = false;
mars_colliding_sphere.name = "mars";

scene.add( mars_colliding_sphere );

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

function rotateAroundWorldAxis( object, axis, radians ) {
    let rotationMatrix = new Matrix4();

    rotationMatrix.makeRotationAxis( axis.normalize(), radians );
    rotationMatrix.multiply( object.matrix );
    object.matrix = rotationMatrix;
    object.rotation.setFromRotationMatrix( object.matrix );
}

function slowRotation( targetRotation, value ) {
    if (Math.abs(targetRotation * 0.999) > value) {
        targetRotation = targetRotation * 0.999;
    } else {
        targetRotation = value;
    }
    return targetRotation;
}

// render function
function render() {
    // make camera follow selected object
    if ( FOLLOW ) {

        switch ( FOLLOW.name ) {
            case 'earth':
                // earth is followed, stop rotation around the sun
                EARTH_SOLAR_ANGLE_SPEED = 0;
                MARS_SOLAR_ANGLE_SPEED = 0.001;
                break;
            case 'mars':
                EARTH_SOLAR_ANGLE_SPEED = 0.003;
                MARS_SOLAR_ANGLE_SPEED = 0;
                break;
            default:
                EARTH_SOLAR_ANGLE_SPEED = 0.003;
                MARS_SOLAR_ANGLE_SPEED = 0.001;
                break;
        }
    } else {
        EARTH_SOLAR_ANGLE_SPEED = 0.003;
        MARS_SOLAR_ANGLE_SPEED = 0.001;
    }

    // dynamic and smooth camera positioning
    camera.position.lerp( CAMERA_POSITION, 0.03 );

    // rotate earth around the sun
    rotateAboutPoint(earth, new Vector3(0, 0, 0), new Vector3(0, 1, 1), EARTH_SOLAR_ANGLE_SPEED);
    earth_colliding_sphere.position.copy( earth.position );

    // rotate mars around the sun
    rotateAboutPoint(mars, new Vector3(0, 0, 0), new Vector3(0, 1, 1), MARS_SOLAR_ANGLE_SPEED);
    mars_colliding_sphere.position.copy( mars.position );

    // rotate the earth
    rotateAroundWorldAxis( earth, new Vector3(0, 1, 0), earthTargetRotationX );
    rotateAroundWorldAxis( earth, new Vector3(1, 0, 0), earthTargetRotationY );

    rotateAroundWorldAxis( mars, new Vector3(0, 1, 0), marsTargetRotationX );
    rotateAroundWorldAxis( mars, new Vector3(1, 0, 0), marsTargetRotationY );

    earthTargetRotationX = slowRotation(earthTargetRotationX, 0.003);
    earthTargetRotationY = slowRotation(earthTargetRotationY, 0.002);
    marsTargetRotationX = slowRotation(marsTargetRotationX, 0.003);
    marsTargetRotationY = slowRotation(marsTargetRotationY, 0.002);


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