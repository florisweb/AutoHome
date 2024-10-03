import { Scene, arrayEquals } from '../sceneLib.js';

export default class extends Scene {
    constructor() {
        super({
            name: 'Cinema',
            requiredServices: ['CableLamp', 'LEDStrip'],
        });
    }

    isActive() {
        return  this.Services.CableLamp.curState.lampOn &&
                this.Services.CableLamp.curState.sternIntensity === 5 && 
                arrayEquals(this.Services.LEDStrip.curState.baseColor, [11, 3, 0])
    }

    onActivate() {
        this.Services.CableLamp.animateSternIntensity(5);
        this.Services.CableLamp.setLampOnState(true);
        this.Services.LEDStrip.animateBaseColor([11, 3, 0]);
    }
}

