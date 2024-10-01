import { Scene, arrayEquals } from '../sceneLib.js';

export default class extends Scene {
    constructor() {
        super({
            name: 'Good Night',
            requiredServices: ['CableLamp', 'LEDStrip'],
        });
    }

    isActive() {
        return  !this.Services.CableLamp.curState.lampOn &&
                this.Services.CableLamp.curState.sternIntensity === 0 && 
                arrayEquals(this.Services.LEDStrip.curState.baseColor, [0, 0, 0])
    }

    onActivate() {
        this.Services.CableLamp.setSternIntensity(0);
        this.Services.CableLamp.setLampOnState(false);
        this.Services.LEDStrip.animateBaseColor([0, 0, 0]);
    }
}