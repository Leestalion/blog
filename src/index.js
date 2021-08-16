import { WEBGL } from './WebGL';
import { WebGLRenderer, AmbientLight, Mesh, PointLight, Vector2, MeshBasicMaterial, Vector3, SphereGeometry, PointsMaterial, Points, BufferGeometry, BufferAttribute } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import './style.css';
import { rotateAboutPoint, getRandomParticlePos, rotateAroundWorldAxis, slowRotation } from './utils';

import GLOBALS from './globals';
import { onMouseDown, onMouseMove, onMouseUp, onMouseWheel } from './userActions';
import { camera, scene } from './settings';

import PLANETS from './loadAssets';

/* #####################################################################################################################
########################################################################################################################
|                                                                                                                      |
|                                                        SETTINGS                                                      |
|                                                                                                                      |
########################################################################################################################
##################################################################################################################### */


window.addEventListener( 'mousemove', onMouseMove );
window.addEventListener( 'mousedown', onMouseDown );
window.addEventListener( 'mouseup', onMouseUp );
window.addEventListener( 'wheel', onMouseWheel );
window.addEventListener( 'resize', onResize, false );

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// WebGL renderer
function getRenderer() {
    const renderer = new WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x020202);
    document.body.appendChild(renderer.domElement);
    return renderer;
}

// light
function addLigths() {
    const light = new PointLight(0xffffff, 2, 0, 2);
    light.position.set(0, 0, 0);
    scene.add(light);
    scene.add(new AmbientLight(0xffffff, 0.1));
}

// stars background
function addStarsBackground() {
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
}

/* #####################################################################################################################
########################################################################################################################
|                                                                                                                      |
|                                                      ASSETS                                                          |
|                                                                                                                      |
########################################################################################################################
##################################################################################################################### */



// Create the sun
function addSun() {
    const sun = new Mesh(new SphereGeometry(100, 100, 20), new MeshBasicMaterial({
        color: "orange",
        wireframe: false
      }));
      sun.layers.enable(1);
      sun.name = "sun";
      scene.add(sun);
}


/* #####################################################################################################################
########################################################################################################################
|                                                                                                                      |
|                                                     POST PROCESSING                                                  |
|                                                                                                                      |
########################################################################################################################
##################################################################################################################### */

function getComposer() {
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

    return composer;
}


/* #####################################################################################################################
########################################################################################################################
|                                                                                                                      |
|                                                           MAIN                                                       |
|                                                                                                                      |
########################################################################################################################
##################################################################################################################### */

const renderer = getRenderer();
const composer = getComposer();

addLigths();
addStarsBackground();
addSun();

function rotatePlanet(planet) {
    rotateAroundWorldAxis( planet.mesh, new Vector3(0, 1, 0), planet.selfRotationX )
    rotateAroundWorldAxis( planet.mesh, new Vector3(1, 0, 0), planet.selfRotationY )
}

function slowPlanetsRotation(planet) {
    planet.selfRotationX = slowRotation( planet.selfRotationX, 0.003 );
    planet.selfRotationY = slowRotation( planet.selfRotationY, 0.002 );
}

// render function
function render() {
    // dynamic and smooth camera positioning
    camera.position.lerp( GLOBALS.cameraPosition, 0.03 );


    for (const planet in PLANETS) {
        // make planets rotate around the sun
        rotateAboutPoint(PLANETS[planet].mesh, new Vector3(0, 0, 0), new Vector3(0, 1, 1), PLANETS[planet].solarRotation);

        // make planets' colliding spheres take the same positions as them
        PLANETS[planet].collidingSphere.position.copy( PLANETS[planet].mesh.position );

        // rotate planets around themselves
        rotatePlanet(PLANETS[planet]);

        // slow their rotations
        slowPlanetsRotation(PLANETS[planet]);
    }


    // rendering sun as glowing element
    renderer.autoClear = false;
    renderer.clear();

    camera.layers.set(1);
    composer.render();

    renderer.clearDepth();
    camera.layers.set(0);
    renderer.render(scene, camera);
}

const animate = function () {
    requestAnimationFrame( animate );

    render();
}

// webGL compaptibility checking
if ( WEBGL.isWebGLAvailable() ) {
    
    animate();

} else {

	const warning = WEBGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );

}