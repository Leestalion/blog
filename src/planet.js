import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import { scene, loader } from './settings';

export default class Planet {
    constructor( model, position, name, size, selfRotationX, selfRotationY, solarRotation ) {
        this.model = model;
        this.position = position;
        this.selfRotationX = selfRotationX;
        this.selfRotationY = selfRotationY;
        this.solarRotation = solarRotation;
        this.name = name;
        this.size = size;
        this.mesh = new Mesh();
        this.collidingSphere;
    }

    addPlanet(gltf) {
        let planet = gltf.scene;
        scene.add( gltf.scene );
        planet.position.copy(this.position);
        return planet;
    }

    init() {
        let that = this;

        loader.load( this.model, function( gltf ) {
            that.mesh = addPlanet(gltf, that.position)
        } );

        this.collidingSphere = addCollidingSphere( this.name, this.size );

        scene.add( this.collidingSphere );
    }
}

function addPlanet(gltf, position) {
    let planet = gltf.scene;
    scene.add( gltf.scene );
    planet.position.copy(position);
    return planet;
}

function addCollidingSphere(name, size) {
    let collider_material = new MeshBasicMaterial({color: "white", wireframe: false});
    let collider_geometry = new SphereGeometry(size, size, 10);
    let collidingSphere = new Mesh( collider_geometry, collider_material );
    collidingSphere.visible = false;
    collidingSphere.name = name;
    return collidingSphere;
}