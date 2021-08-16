import { Matrix4 } from 'three';

function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
    pointIsWorld = ( pointIsWorld === undefined )? false: pointIsWorld;

    if(pointIsWorld) {
        obj.parent.locateToWorld(obj.position); //compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the position
    obj.position.add(point); // re-add the offset

    if (pointIsWorld) {
        obj.parent.worldToLocal(obj.position); //undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the Object
}

const getRandomParticlePos = (particleCount) => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        arr[i] = (Math.random() - 0.5) * 10;
    }
    return arr;
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

export { rotateAboutPoint, getRandomParticlePos, rotateAroundWorldAxis, slowRotation };