import { Scene, arrayEquals } from '../sceneLib.js';

export default class extends Scene {
    constructor() {
        super({
            name: 'Evening Pianist',
            requiredServices: ['CableLamp', 'LEDStrip'],
        });
    }

    isActive() {
        return  !this.Services.CableLamp.curState.lampOn &&
                this.Services.CableLamp.curState.sternIntensity === 5 && 
                arrayEquals(this.Services.LEDStrip.curState.baseColor, [50, 0, 0])
    }

    onActivate() {
        this.Services.CableLamp.animateSternIntensity(5, 4000);
        this.Services.CableLamp.setLampOnState(false);
        this.Services.LEDStrip.animateBaseColor([50, 0, 0], 4000);
    }
}

