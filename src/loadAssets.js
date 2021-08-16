import PLANET from "./planet";
import earth_model from './3Dmodels/earth.glb';
import { Vector3 } from "three";
import mars_model from './3Dmodels/mars.glb';

const earth = new PLANET(earth_model, new Vector3(400, 200, 0), "earth", 30, 0.0005, 0.0005, 0.003);
earth.init();

const mars = new PLANET(mars_model , new Vector3(600, 300, 0), "mars", 18, 0.0005, 0.0005, 0.001);
mars.init();

export default {
    [earth.name]: earth,
    [mars.name]: mars
};