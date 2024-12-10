import { Automation } from '../automationLib.js';

export default class extends Automation {
    constructor() {
        super({
            name: "On Wakup",
            requiredServices: ['SceneManager'],
            triggers: [{
                service: 'StateManager',
                event: 'onWakeUp',
            }]
        })
    }

    onTrigger(_event, _triggerService, { SceneManager }) {
        SceneManager.activateScene('GoodMorning');
    }
}