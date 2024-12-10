import { Automation } from '../automationLib.js';

export default class extends Automation {
    constructor() {
        super({
            name: "On Bed Time Start",
            requiredServices: ['SceneManager'],
            triggers: [{
                service: 'StateManager',
                event: 'onBedTimeStart',
            }]
        })
    }

    onTrigger(_event, _triggerService, { SceneManager }) {
        SceneManager.activateScene('GoodNight');
    }
}