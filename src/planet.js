import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import { scene, loader } from './settings';

export default class Planet {
    constructor( model, position, name, size, selfRotationX, selfRotationY, solarRotation ) {
        this.model = model;
        this.position = position;
        this.selfRotationX = selfRotationX;
        this.selfRotationY = selfRotationY;
        this.solarRotation = solarRotation;
        this.defaultSolarRotation = solarRotation;
        this.name = name;
        this.size = size;
        this.mesh = new Mesh();
        this.collidingSphere;

        this.addPlanet = function(gltf, position) {
            let planet = gltf.scene;
            scene.add( gltf.scene );
            planet.position.copy(position);
            return planet;
        }

        this.addCollidingSphere = function(name, size) {
            let collider_material = new MeshBasicMaterial({color: "white", wireframe: false});
            let collider_geometry = new SphereGeometry(size, size, 10);
            let collidingSphere = new Mesh( collider_geometry, collider_material );
            collidingSphere.visible = false;
            collidingSphere.name = name;
            return collidingSphere;
        }

        this.init = function() {
            let that = this;
    
            loader.load( this.model, function( gltf ) {
                that.mesh = that.addPlanet(gltf, that.position)
            } );
    
            this.collidingSphere = this.addCollidingSphere( this.name, this.size );
    
            scene.add( this.collidingSphere );
        }

        this.init();

    }
}