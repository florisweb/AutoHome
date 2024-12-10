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
            },
            {
                service: 'StateManager',
                event: 'curState'
            }]
        }, {
            autoLightsOffTimeout: 5 * 60 * 1000,
            minLightLevel: 5,
        })
    }
        

    onTrigger(_event, _triggerService, { StateManager, LEDStrip, SceneManager }) {
        if (_triggerService.id === "LEDStrip")
        {
            if (_event.type === 'IRSensorEvent' && _event.data === false)
            {
                this.#startTurnOffTimeout();
                return;
            }
        }

        if (StateManager.curState.curFocus === 'Sleep') return; // Don't turn lights on when sleeping
        if (LEDStrip.curState.insideLightLevel > this.Config.minLightLevel) return;
        if (!LEDStrip.curState.IRSensorSeesSomething) return;
        if (SceneManager.getCurSceneId() !== 'GoodNight') return;
        
        SceneManager.activateScene('GoodMorning');        
    }

    #startTurnOffTimeout() {
        clearTimeout(curSensorTimeout);
        curSensorTimeout = setTimeout(() => {
            Logger.log("Timeout elapsed", {scene: this.Services.SceneManager.getCurSceneId(), IR: this.Services.LEDStrip.curState.IRSensorSeesSomething}, "AUTOMATOR");
            if (this.Services.SceneManager.getCurSceneId() !== 'GoodMorning') return;
            if (this.Services.LEDStrip.curState.IRSensorSeesSomething) return;
            this.Services.SceneManager.activateScene('GoodNight');
        }, this.Config.autoLightsOffTimeout);
    }
}