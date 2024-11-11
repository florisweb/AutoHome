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
            autoLightsOffTimeout: 5 * 60 * 1000,
            minLightLevel: 5,
        })
    }
        

    onTrigger(_event, _triggerService, { StateManager, LEDStrip, SceneManager }) {
        Logger.log(`Light-detect-event: IR: ${_event.data}, focus: ${StateManager.curState.curFocus}, lightlevel: ${LEDStrip.curState.insideLightLevel} <= 5?, curScene: ${SceneManager.getCurSceneId()}`, null, "STATEMANAGER-DEBUG");
        
        curSensorTimeout = setTimeout(() => {
            if (SceneManager.getCurSceneId() !== 'GoodMorning') return;
            SceneManager.activateScene('GoodNight');
        }, this.Config.autoLightsOffTimeout);
        
        if (StateManager.curState.curFocus === 'Sleep') return; // Don't turn lights on when sleeping
        if (LEDStrip.curState.insideLightLevel > this.Config.minLightLevel) return;
        if (SceneManager.getCurSceneId() !== 'GoodNight') return;
        
        SceneManager.activateScene('GoodMorning');        
    }
}