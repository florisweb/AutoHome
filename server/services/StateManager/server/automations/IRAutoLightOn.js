import Logger from '../../../../logger.js';
import { Automation } from '../automationLib.js';

let curSensorTimeout;
export default class extends Automation {
    constructor() {
        super({
            name: "Automatic Lights",
            requiredServices: ['LEDStrip', 'StateManager', 'SceneManager'],
            triggers: [{
                service: 'LEDStrip',
                event: 'IRSensorEvent',
                value: true
            }]
        }, {
            autoLightsOffTimeout: 30 * 60 * 1000,
            minLightLevel: 5,
        })
    }
        

    onTrigger(_event, _triggerService, { StateManager, LEDStrip, SceneManager }) {
        this.#startTurnOffTimeout();
        if (StateManager.curState.curFocus === 'Sleep') return; // Don't turn lights on when sleeping
        if (LEDStrip.curState.insideLightLevel > this.Config.minLightLevel) return;
        if (SceneManager.getCurSceneId() !== 'GoodNight') return;
        
        SceneManager.activateScene('GoodMorning');        
    }

    #startTurnOffTimeout() {
        clearTimeout(curSensorTimeout);
        curSensorTimeout = setTimeout(() => {
            if (this.Services.SceneManager.getCurSceneId() !== 'GoodMorning') return;
            if (this.Services.LEDStrip.curState.IRSensorSeesSomething) return this.#startTurnOffTimeout();
            this.Services.SceneManager.activateScene('GoodNight');
        }, this.Config.autoLightsOffTimeout);
    }
}