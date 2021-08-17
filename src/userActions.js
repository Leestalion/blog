import { Raycaster, Vector2, Vector3 } from "three";
import { camera, scene } from "./settings";
import GLOBALS from './globals';
import { removeCloseButtons, addCloseButton } from './userInterface';

import PLANETS from './loadAssets';
console.log(PLANETS);

let mouse = new Vector2();

let mouseXOnMouseDown = 0;
let mouseYOnMouseDown = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// raycaster
function getRaycaster() {
    const raycaster = new Raycaster();
    raycaster.far = 10000;
    raycaster.near = 0;
    raycaster.layers.enableAll();
    return raycaster;
}

const raycaster = getRaycaster();

// zoom functions
function onMouseWheel( event ) {
    const dist_max = 3000;
    let dist_min = 300;
    const zoomOut = 1;
    const zoomIn = -1;
    let distance = 0;

    const delta = Math.sign( event.deltaY );

    if ( GLOBALS.follow ) {
        distance = GLOBALS.follow.position.distanceTo(GLOBALS.cameraPosition)
        if (GLOBALS.follow.name in PLANETS) {
            dist_min = PLANETS[GLOBALS.follow.name].size * 3;
        } else {
            dist_min = 300;
        }
    }
    
    if ( (distance <= dist_max || delta == zoomIn) && (distance >= dist_min || delta == zoomOut) ) {
        GLOBALS.cameraPosition.z += delta * distance/20;
    }
}


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

    if ( GLOBALS.follow && intersects.length > 0 && intersects[ 0 ].object && intersects[ 0 ].object.name && GLOBALS.mouseDown == 1 && (GLOBALS.follow.name in PLANETS)) {
        PLANETS[GLOBALS.follow.name].selfRotationX = ( mouseX - mouseXOnMouseDown ) * 0.0005;
        PLANETS[GLOBALS.follow.name].selfRotationY = ( mouseY - mouseYOnMouseDown ) * 0.0005;
    }

}

function onMouseDown( event ) { 
    event.preventDefault();

    ++GLOBALS.mouseDown;
    mouseXOnMouseDown = event.clientX - windowHalfX;
    mouseYOnMouseDown = event.clientY - windowHalfY;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    // calculates  objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );

    // make intersected objects emissive
    if ( intersects.length > 0) {
        if ( intersects[ 0 ].object && intersects[ 0 ].object.name ) {
            GLOBALS.follow = intersects[ 0 ].object
            let offset_value;
            removeCloseButtons();
            addCloseButton();

            if (GLOBALS.follow.name in PLANETS) {
                for (const planet in PLANETS) {
                    
                    if (GLOBALS.follow.name == planet) {
                        
                        PLANETS[planet].solarRotation = 0;
                        offset_value = 200;

                    } else {
                        PLANETS[planet].solarRotation = PLANETS[planet].defaultSolarRotation;
                    }
                    
                }
            } else {
                offset_value = 1000;
            }
            
            const offset = new Vector3( GLOBALS.follow.position.x, GLOBALS.follow.position.y, GLOBALS.follow.position.z + offset_value );
            GLOBALS.cameraPosition = offset;
        }
    }
}

function onMouseUp() {
    --GLOBALS.mouseDown;
}

export { onMouseDown, onMouseMove, onMouseUp, onMouseWheel}