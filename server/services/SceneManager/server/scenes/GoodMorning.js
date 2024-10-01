import { Scene, arrayEquals } from '../sceneLib.js';

export default class extends Scene {
    constructor() {
        super({
            name: 'Good Morning',
            requiredServices: ['CableLamp', 'LEDStrip'],
        });
    }

    isActive() {
        return  this.Services.CableLamp.curState.lampOn &&
                this.Services.CableLamp.curState.sternIntensity === 100 && 
                arrayEquals(this.Services.LEDStrip.curState.baseColor, [255, 113, 0])
    }

    onActivate() {
        this.Services.CableLamp.setSternIntensity(100);
        this.Services.CableLamp.setLampOnState(true);
        this.Services.LEDStrip.setBaseColor([255, 113, 0]);
    }
}

