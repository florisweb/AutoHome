import { Service } from '../../../serviceLib.js';
import { FileManager } from '../../../DBManager.js';
let ConfigFileManager = new FileManager("../config.json");
const Config = await ConfigFileManager.getContent(true);
const EarthCircumference = 6371; // km

export default class extends Service {
    #Services = {};

    constructor({id, config}) {
        super(arguments[0]);
    }


    onLoadRequiredServices({ShortCutAPI, SceneManager, PianoManager}) {
        this.#Services = arguments[0];
        if (!ShortCutAPI) return console.error(`${this.serviceId}: Error while loading, ShortCutAPI not found`);
        ShortCutAPI.subscribe({
            acceptorService: this,
            onEvent: async (_data) => {
                switch (_data.type) 
                {
                    case "onWindDownStart":
                        break;
                    case "onBedTimeStart":
                        SceneManager.activateScene('GoodNight');
                        break;
                    case "onWakeUp":
                        SceneManager.activateScene('GoodMorning');
                        break;
                }
            }
        });

        let prevPianoIsBeingPlayed = false;
        PianoManager.subscribe({
            acceptorService: this,
            onEvent: async (_event) => {
                if (_event.type != 'curState') return;
                if (_event.data.pianoIsBeingPlayed && !prevPianoIsBeingPlayed && new Date().getHours() > 20)
                {
                    SceneManager.activateScene('EveningPianist');
                }
                prevPianoIsBeingPlayed = _event.data.pianoIsBeingPlayed
            }
        })
    }

    onWantedServiceLoad(_Service) {
        switch (_Service.id)
        {
            case "LocTracker":
                _Service.subscribe({
                    onEvent: (_event) => {
                        if (_event.type !== 'curState') return;
                        if (_event.data.curLat === 0 || _event.data.curLong === 0) return; // No actual data - startup
                        let distance = distanceBetweenPoints(_event.data.curLat, _event.data.curLong, Config.location.lat, Config.location.long);
                        if (distance < Config.location.range) return; // At home / close to home
                        this.#Services.SceneManager.activateScene('GoodNight'); // Turn lamps off when not home
                    }
                })

                break;
        }
    }
}




function distanceBetweenPoints(_lat1, _long1, _lat2, _long2) {
    let lat1 = _lat1 / 180 *  Math.PI;
    let lat2 = _lat2 / 180 *  Math.PI;
    let long1 = _long1 / 180 *  Math.PI;
    let long2 = _long2 / 180 * Math.PI;
    return 2 * EarthCircumference * Math.asin(Math.sqrt(Math.sin((lat2 - lat1)/2)**2 + Math.cos(lat1) * Math.cos(lat2) * (Math.sin((long2 - long1)/2)**2)));
}






