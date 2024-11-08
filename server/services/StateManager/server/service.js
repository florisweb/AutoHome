import { Service, ServiceState } from '../../../serviceLib.js';
import { FileManager } from '../../../DBManager.js';
let ConfigFileManager = new FileManager("../config.json");
const Config = await ConfigFileManager.getContent(true);
const EarthCircumference = 6371; // km

export default class extends Service {
    #Services = {};
    curState = new ServiceState({
        curFocus: '',
    });

    constructor({id, config}) {
        super(arguments[0]);
    }


    onLoadRequiredServices({ShortCutAPI, SceneManager, PianoManager, LEDStrip}) {
        this.#Services = arguments[0];
        if (!ShortCutAPI) return console.error(`${this.serviceId}: Error while loading, ShortCutAPI not found`);
        ShortCutAPI.subscribe({
            acceptorService: this,
            onEvent: async (_event) => {
                switch (_event.type) 
                {
                    case "onWindDownStart":
                        break;
                    case "onBedTimeStart":
                        SceneManager.activateScene('GoodNight');
                        break;
                    case "onWakeUp":
                        SceneManager.activateScene('GoodMorning');
                        break;
                    case "setFocus":
                        this.curState.curFocus = _event.data;
                        this.pushCurState();
                        break;
                }
            }
        });

        let overwrittenScene;
        PianoManager.subscribe({
            acceptorService: this,
            onEvent: async (_event) => {
                if (_event.type != 'curState') return;
                if (_event.data.pianoIsBeingPlayed)
                {
                    if (new Date().getHours() >= 19 && SceneManager.getCurSceneId() !== 'EveningPianist')
                    {
                        overwrittenScene = SceneManager.getCurSceneId();
                        SceneManager.activateScene('EveningPianist');
                    }
                } else {
                    if (SceneManager.getCurSceneId() === 'EveningPianist')
                    {
                        SceneManager.activateScene(overwrittenScene);
                    }
                }
            }
        });




        let curSensorTimeout;
        const autoLightsOffTimeout = 5 * 60 * 1000;
        LEDStrip.subscribe({
            acceptorService: this,
            onEvent: async (_event) => {
                if (_event.type != 'IRSensorEvent') return;
                if (!_event.data) return;

                clearTimeout(curSensorTimeout);
                curSensorTimeout = setTimeout(() => {
                    if (SceneManager.getCurSceneId() !== 'GoodMorning') return;
                    SceneManager.activateScene('GoodNight');
                }, autoLightsOffTimeout);
                
                if (this.curState.curFocus === 'Sleep') return; // Don't turn lights on when sleeping
                if (LEDStrip.curState.insideLightLevel > 5) return;
                if (SceneManager.getCurSceneId() !== 'GoodNight') return;
                SceneManager.activateScene('GoodMorning');
            }
        });
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






