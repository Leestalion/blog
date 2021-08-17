import PLANET from "./planet";
import { Vector3 } from "three";

import earth_model from './3Dmodels/earth.glb';
import mars_model from './3Dmodels/mars.glb';
import venus_model from './3Dmodels/venus.glb';
import mercure_model from './3Dmodels/mercure.glb';

const earth = new PLANET(earth_model, new Vector3(400, 200, 0), "earth", 30, 0.0005, 0.0005, 0.003);

const mars = new PLANET(mars_model , new Vector3(600, 300, 0), "mars", 18, 0.0005, 0.0005, 0.002);

const venus = new PLANET(venus_model , new Vector3(900, 400, 0), "venus", 36, 0.0005, 0.0005, 0.001);

const mercure = new PLANET(mercure_model , new Vector3(200, 200, 0), "mercure", 18, 0.0005, 0.0005, 0.004);

export default {
    [earth.name]: earth,
    [mars.name]: mars,
    [venus.name]: venus,
    [mercure.name]: mercure
};