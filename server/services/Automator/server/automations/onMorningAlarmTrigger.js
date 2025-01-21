import { Automation } from '../automationLib.js';

export default class extends Automation {
    constructor() {
        super({
            name: "On morning alarm trigger",
            requiredServices: ['SceneManager'],
            triggers: [{
                service: 'StateManager',
                event: 'onMorningAlarmTrigger',
            }]
        })
    }

    onTrigger(_event, _triggerService, { SceneManager }) {
        SceneManager.activateScene('GoodMorningDynamic');
    }
}