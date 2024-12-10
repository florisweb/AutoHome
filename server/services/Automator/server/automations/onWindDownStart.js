import { Automation, wait } from '../automationLib.js';

export default class extends Automation {
    constructor() {
        super({
            name: "On WindDown Start",
            requiredServices: ['SceneManager'],
            triggers: [{
                service: 'StateManager',
                event: 'onWindDownStart',
            }]
        }, {
            readDuration: 15 * 60 * 1000
        })
    }

    async onTrigger(_event, _triggerService, { SceneManager }) {
        SceneManager.activateScene('ReadBeforeBed');
        await wait(this.Config.readDuration);
        SceneManager.activateScene('GoodNight');
    }
}