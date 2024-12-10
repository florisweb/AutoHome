import { Automation } from '../automationLib.js';
import { FileManager } from '../../../../DBManager.js';
let ConfigFileManager = new FileManager("../config.json");
const Config = await ConfigFileManager.getContent(true);

let overwrittenScene;
export default class extends Automation {
    constructor() {
        super({
            name: "Location Based Scene Disabler",
            requiredServices: ['SceneManager'],
            triggers: [{
                service: 'LocTracker',
                event: 'curState',
            }]
        });
    }
        

    onTrigger(_event, _triggerService, { SceneManager }) {
        if (_event.data.curLat === 0 || _event.data.curLong === 0) return; // No actual data - startup
        let distance = distanceBetweenPoints(_event.data.curLat, _event.data.curLong, Config.location.lat, Config.location.long);
        if (distance < Config.location.range) return; // At home / close to home
        SceneManager.activateScene('GoodNight'); // Turn lamps off when not home
    }
}



const EarthCircumference = 6371; // km
function distanceBetweenPoints(_lat1, _long1, _lat2, _long2) {
    let lat1 = _lat1 / 180 *  Math.PI;
    let lat2 = _lat2 / 180 *  Math.PI;
    let long1 = _long1 / 180 *  Math.PI;
    let long2 = _long2 / 180 * Math.PI;
    return 2 * EarthCircumference * Math.asin(Math.sqrt(Math.sin((lat2 - lat1)/2)**2 + Math.cos(lat1) * Math.cos(lat2) * (Math.sin((long2 - long1)/2)**2)));
}


