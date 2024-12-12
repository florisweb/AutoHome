import { Automation } from '../automationLib.js';

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
        if (_triggerService.isAtHome()) return;
        SceneManager.activateScene('GoodNight'); // Turn lamps off when not home
    }
}