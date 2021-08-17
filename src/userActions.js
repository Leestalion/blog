import { Raycaster, Vector2, Vector3 } from "three";
import { camera, scene } from "./settings";
import GLOBALS from './globals';
import { removeCloseButtons, addCloseButton } from './userInterface';

import PLANETS from './loadAssets';

export default class UserActions {
    constructor() {

        this.mouseXOnMouseDown = 0;
        this.mouseYOnMouseDown = 0;

        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.mouse = new Vector2();

        // raycaster
        this.getRaycaster = function() {
            const raycaster = new Raycaster();
            raycaster.far = 10000;
            raycaster.near = 0;
            raycaster.layers.enableAll();
            return raycaster;
        }

        this.raycaster = this.getRaycaster();

        window.addEventListener( 'mousemove', onMouseMove );
        window.addEventListener( 'mousedown', onMouseDown );
        window.addEventListener( 'mouseup', onMouseUp );
        window.addEventListener( 'wheel', onMouseWheel );
        window.addEventListener( 'touchstart', onTouchStart );
        window.addEventListener( 'touchmove', onTouchMove );
        window.addEventListener( 'touchEnd', onTouchEnd );


        const scope = this;

        let fingerStartDist = 0;
        let fingerDist;
        let scaling = false;

        // zoom functions
        function zoom( delta ) {
            const dist_max = 3000;
            let dist_min = 300;
            const zoomOut = 1;
            const zoomIn = -1;
            let distance = 0;

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

        function onMouseWheel( event ) {

            const delta = Math.sign( event.deltaY );

            zoom( delta );
        }

        function onMouseMove( event ) {
            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components

            scope.mouse.x = ( event.clientX / window.innerWidth) * 2 - 1;
            scope.mouse.y = - ( event.clientY / window.innerHeight) * 2 + 1;
        
            scope.raycaster.setFromCamera( scope.mouse, camera );
        
            // calculates  objects intersecting the picking ray
            const intersects = scope.raycaster.intersectObjects( scene.children );
        
            // move planet
            let mouseX = event.clientX - scope.windowHalfX;
            let mouseY = event.clientY - scope.windowHalfY;
        
            if ( GLOBALS.follow && intersects.length > 0 && intersects[ 0 ].object && intersects[ 0 ].object.name && GLOBALS.mouseDown == 1 && (GLOBALS.follow.name in PLANETS)) {
                PLANETS[GLOBALS.follow.name].selfRotationX = ( mouseX - scope.mouseXOnMouseDown ) * 0.0005;
                PLANETS[GLOBALS.follow.name].selfRotationY = ( mouseY - scope.mouseYOnMouseDown ) * 0.0005;
            }
        
        }

        function onMouseDown( event ) { 
            event.preventDefault();
        
            ++GLOBALS.mouseDown;
            scope.mouseXOnMouseDown = event.clientX - scope.windowHalfX;
            scope.mouseYOnMouseDown = event.clientY - scope.windowHalfY;
        
            // update the picking ray with the camera and mouse position
            scope.raycaster.setFromCamera( scope.mouse, camera );
        
            // calculates  objects intersecting the picking ray
            const intersects = scope.raycaster.intersectObjects( scene.children );
        
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

        function onTouchStart( event ) {
            if ( event.touches.length === 2 ) {
                scaling = true;
                fingerStartDist = Math.hypot(
                    event.touches[0].pageX - event.touches[1].pageX,
                    event.touches[0].pageY - event.touches[1].pageY);
            }
        }

        function onTouchMove( event ) {
            if ( scaling == true ) {
                fingerDist = Math.hypot(
                    event.touches[0].pageX - event.touches[1].pageX,
                    event.touches[0].pageY - event.touches[1].pageY);
                const delta = (fingerDist < fingerStartDist) ? 1 : -1 ;
                zoom( delta );
                fingerStartDist = fingerDist;
            }
        }

        function onTouchEnd( event ) {
            scaling = false;
        }
    }
}