import { Raycaster, Vector2, Vector3 } from "three";
import { camera, scene } from "./settings";
import GLOBALS from './globals';

import PLANETS from './loadAssets';

export default class UserActions {
    constructor( domElement ) {
        this.domElement = domElement;

        this.touchXOnTouchDown = 0;
        this.touchYOnTouchDown = 0;

        this.pointerXOnPointereDown = 0;
        this.pointerYOnPointerDown = 0;

        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.pointer = new Vector2();
        this.finger = new Vector2();

        // raycaster
        this.getRaycaster = function() {
            const raycaster = new Raycaster();
            raycaster.far = 10000;
            raycaster.near = 0;
            raycaster.layers.enableAll();
            return raycaster;
        }

        this.raycaster = this.getRaycaster();

        window.addEventListener( 'pointermove', onPointerMove );
        window.addEventListener( 'pointerdown', onPointerDown );
        window.addEventListener( 'pointerup', onPointerUp );
        // window.addEventListener( 'touchstart', onTouchStart );
        // window.addEventListener( 'touchmove', onTouchMove );
        // window.addEventListener( 'touchend', onTouchEnd );
        this.domElement.style.touchAction = 'none'; // disable touch scroll


        const scope = this;
        let TOUCH_POINTS = [];

        let fingerStartDist = 0;
        let fingerDist;

        const STATE = {
            IDLE: 0,
            SELECTED: 1
        };

        let state = STATE.IDLE;

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

        function rotates( intersects, pointerX, pointerY, pointerXOnPointerDown, pointerYOnPointerDown ) {
            // move planet
            if ( GLOBALS.follow && intersects.length > 0 && intersects[ 0 ].object && intersects[ 0 ].object.name && ( GLOBALS.mouseDown == 1 ) && (GLOBALS.follow.name in PLANETS)) {
                PLANETS[GLOBALS.follow.name].selfRotationX = ( pointerX - pointerXOnPointerDown ) * 0.0005;
                PLANETS[GLOBALS.follow.name].selfRotationY = ( pointerY - pointerYOnPointerDown ) * 0.0005;
            }
        }

        function updatePointer(x, y, id) {
            TOUCH_POINTS.findIndex( function( point, index ) {
                if (point.pointer_id == id ) {
                    point.x = x;
                    point.y = y;
                }
            });
        }

        function onPointerMove( event ) {
            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components

            switch( TOUCH_POINTS.length ) {
                case 1:
                    updatePointer( event.pageX, event.pageY, event.pointerId)
                    scope.pointer.x = ( event.clientX / window.innerWidth) * 2 - 1;
                    scope.pointer.y = - ( event.clientY / window.innerHeight) * 2 + 1;
                
                    scope.raycaster.setFromCamera( scope.pointer, camera );
                
                    // calculates  objects intersecting the picking ray
                    const intersects = scope.raycaster.intersectObjects( scene.children );
        
                    let pointerX = event.clientX - scope.windowHalfX;
                    let pointerY = event.clientY - scope.windowHalfY;
                
                    rotates( intersects, pointerX, pointerY, scope.pointerXOnPointerDown, scope.pointerYOnPointerDown );
                    break;

                case 2:
                    updatePointer( event.pageX, event.pageY, event.pointerId)
                    fingerDist = Math.hypot(
                        event.pageX - TOUCH_POINTS[1].x,
                        event.pageY - TOUCH_POINTS[1].y);
    
                    const delta = (fingerDist < fingerStartDist) ? 1 : -1 ;
                    zoom( delta );
                    fingerStartDist = fingerDist;
            }
        }

        function moveCamera( intersects ) {
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
                    state = STATE.SELECTED;
                    window.addEventListener( 'wheel', onMouseWheel );
                }
            }
        }

        function onPointerDown( event ) { 
            event.preventDefault();
            TOUCH_POINTS.push({ 
                pointer_id: event.pointerId,
                x: event.pageX,
                y: event.pageY
            });

            switch( TOUCH_POINTS.length ) { 
                case 1:
                    ++GLOBALS.mouseDown;

                    scope.pointerXOnPointerDown = event.clientX - scope.windowHalfX;
                    scope.pointerYOnPointereDown = event.clientY - scope.windowHalfY;
    
                    scope.pointer.x = ( event.clientX / window.innerWidth) * 2 - 1;
                    scope.pointer.y = - ( event.clientY / window.innerHeight) * 2 + 1;
    
                    if ( state == STATE.IDLE ) {
                        // get raycaster
                        scope.raycaster.setFromCamera( scope.pointer, camera );
                        const intersects = scope.raycaster.intersectObjects( scene.children );
        
                        // move camera on the intersected object
                        moveCamera( intersects );
                    }
                    break;
                case 2:
                    fingerStartDist = Math.hypot( 
                        TOUCH_POINTS[0].x - TOUCH_POINTS[1].x,
                        TOUCH_POINTS[0].y - TOUCH_POINTS[1].y);
                    break;
            }
        }

        function onPointerUp( event ) {
            --GLOBALS.mouseDown;

            let index = TOUCH_POINTS.findIndex( function( point, index ) {
                if (point.pointer_id == event.pointerId ) {
                    return true;
                }
            })
            TOUCH_POINTS.splice( index, 1 );
        }

        function addCloseButton() {
            let leaveDiv = document.createElement('button');
            leaveDiv.innerHTML = "x";
            leaveDiv.classList.add("close");
            leaveDiv.style.touchAction = 'none';
            leaveDiv.addEventListener("click", resetCameraPos);
            leaveDiv.addEventListener("touchstart", resetCameraPos);
            document.body.appendChild(leaveDiv);
        }
        
        function resetCameraPos() {
            removeCloseButtons();
            state = STATE.IDLE;
            for (const planet in PLANETS) {
                PLANETS[planet].solarRotation = PLANETS[planet].defaultSolarRotation;
            }
            GLOBALS.follow = null;
            GLOBALS.cameraPosition = GLOBALS.defaultCameraPosition;
            window.removeEventListener( 'wheel', onMouseWheel );
        }
        
        function removeCloseButtons() {
            let toDelete = document.body.getElementsByClassName("close");
            if ( toDelete.length > 0 ) {
                for ( let i = 0; i <= toDelete.length; i ++ ) {
                    document.body.removeChild( toDelete[ i ] );
                }
            }
        }
    }
}