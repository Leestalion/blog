import { Vector3 } from "three";

export default {
    follow: null,
    defaultCameraPosition: new Vector3(0, 0, 1500),
    cameraPosition: new Vector3(0, 0, 1500),
    mouseDown: 0,

    earth: {
        solarAngleSpeed: 0.003,
        targetRotationX: 0.0005,
        targetRotationY: 0.0005,
    },
    mars: {
        solarAngleSpeed: 0.002,
        targetRotationX: 0.0005,
        targetRotationY: 0.0005,
    },
}