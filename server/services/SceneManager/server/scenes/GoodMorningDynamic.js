import { DynamicScene, arrayEquals } from '../sceneLib.js';


export default class extends DynamicScene {
    constructor() {
        super({
            name: 'Good Morning Auto',
            requiredServices: ['CableLamp', 'LEDStrip'],
            hiddenInUI: true,
        }, {
            animateInDuration: 1000 * 60
        });
    }

    isActive() {
        if (this.running) return true;
        return  this.Services.CableLamp.curState.lampOn &&
                this.Services.CableLamp.curState.sternIntensity === 100 && 
                arrayEquals(this.Services.LEDStrip.curState.baseColor, [255, 191, 0])
    }

    onActivate(_animateIn = false) {
        if (!_animateIn)
        {
            this.Services.CableLamp.animateSternIntensity(100);
            this.Services.LEDStrip.animateBaseColor([255, 191, 0]);
            this.Services.CableLamp.setLampOnState(true);
            return;
        }

        this.Services.CableLamp.animateSternIntensity(100, this.config.animateInDuration);
        this.Services.LEDStrip.animateBaseColor([255 * .1, 191 * .1, 0], 300);

        setTimeout(() => {
            if (!this.running) return;
            this.Services.LEDStrip.animateBaseColor([255, 191, 0], this.config.animateInDuration - 300);
        }, 300);

        setTimeout(() => {
            if (!this.running) return;
            this.Services.CableLamp.setLampOnState(true);
        }, this.config.animateInDuration);   
    }
}

