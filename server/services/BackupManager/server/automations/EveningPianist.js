import { Automation } from '../automationLib.js';

let overwrittenScene;
export default class extends Automation {
    constructor() {
        super({
            name: "Evening Pianist",
            requiredServices: ['SceneManager'],
            triggers: [{
                service: 'PianoManager',
                event: 'curState',
            }]
        }, {
            turnOnAfter: 19, // H
        })
    }
        

    onTrigger(_event, _triggerService, { SceneManager }) {
        if (_event.data.pianoIsBeingPlayed)
        {
            if (new Date().getHours() >= this.Config.turnOnAfter && SceneManager.getCurSceneId() !== 'EveningPianist')
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
}