import { DynamicScene, arrayEquals } from '../sceneLib.js';

export default class extends DynamicScene {
    constructor() {
        super({
            name: 'Lit',
            requiredServices: ['CableLamp', 'LEDStrip'],
        });
    }

    onActivate() {
        this.onEvent({}); 
    }  
    
    #loopRunning = false;
    onEvent(_event, _serviceId) {
        if (!this.#loopRunning) this.loop(100);
    }

    loop(_countsLeft = 0) {
        const targetLightLevel = 5;
        this.#loopRunning = true;

        let totalIntensity = this.Services.LEDStrip.curState.baseColor.reduce((a, b) => a + b, 0);
        let deltaLightLevel = targetLightLevel - this.Services.LEDStrip.curState.insideLightLevel;
        if (deltaLightLevel === 0 || _countsLeft <= 0 || !this.running || (this.totalIntensity === 255 * 3 && deltaLightLevel > 0)) return this.#loopRunning = false;

        if (totalIntensity < 100 && deltaLightLevel > 0) 
        {
            this.Services.LEDStrip.animateBaseColor([45, 45, 45]);
        } else {
            this.Services.LEDStrip.animateBaseColor([
                Math.max(Math.min(Math.round(this.Services.LEDStrip.curState.baseColor[0] * (1 + deltaLightLevel * .1)), 255), 0), 
                Math.max(Math.min(Math.round(this.Services.LEDStrip.curState.baseColor[1] * (1 + deltaLightLevel * .1)), 255), 0), 
                Math.max(Math.min(Math.round(this.Services.LEDStrip.curState.baseColor[2] * (1 + deltaLightLevel * .1)), 255), 0)
            ]);
        }
        
        setTimeout(() => this.loop(_countsLeft--), 500);
    }
}

