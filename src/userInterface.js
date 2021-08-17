import GLOBALS from './globals';
import PLANETS from './loadAssets';

function addCloseButton() {
    let leaveDiv = document.createElement('button');
    leaveDiv.innerHTML = "x";
    leaveDiv.classList.add("close");
    leaveDiv.style.touchAction = 'none';
    leaveDiv.addEventListener("click", function() {
        removeCloseButtons();
        for (const planet in PLANETS) {
            PLANETS[planet].solarRotation = PLANETS[planet].defaultSolarRotation;
        }
        GLOBALS.follow = null;
        GLOBALS.cameraPosition = GLOBALS.defaultCameraPosition;
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

export { addCloseButton, removeCloseButtons };