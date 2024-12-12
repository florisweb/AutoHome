import { Service, ServiceState } from '../../../serviceLib.js';

import Logger from '../../../logger.js';
export default class extends Service {
    curState = new ServiceState({
        curFocus: '',
        isSleeping: false, // Defines whether I am sleeping (at home)
    });

    onLoadRequiredServices({ShortCutAPI, CableLamp, LEDStrip, LocTracker}) {
        ShortCutAPI?.subscribe({
            acceptorService: this,
            onEvent: async (_event) => {
                switch (_event.type) 
                {
                    case "onWindDownStart":
                    case "onBedTimeStart":
                    case "onWakeUp":
                        this.pushEvent({type: _event.type, data: _event.data});
                        break;
                    case "setFocus":
                        this.curState.curFocus = _event.data;
                        this.pushCurState();
                        this.#recalcSleepingState();
                        break;
                }
                Logger.log(`Focus changed to ${this.curState.curFocus || 'none'}`, null, "STATEMANAGER");
            }
        });

        CableLamp?.subscribe({onEvent: () => this.#recalcSleepingState()});
        LEDStrip?.subscribe({onEvent: () => this.#recalcSleepingState()});
        LocTracker?.subscribe({onEvent: () => this.#recalcSleepingState()});
    }

    #recalcSleepingState() {
        let prevState = this.curState.isSleeping;
        let lightsOff = 
            !this.Services.CableLamp.curState.lampOn && 
            this.Services.CableLamp.curState.sternIntensity === 0 &&
            this.Services.LEDStrip.curState.baseColor.reduce((a, b) => a + b, 0) === 0
        let isDark = this.Services.LEDStrip.curState.insideLightLevel < 5;
        let sleepFocusOn = this.curState.curFocus === 'Sleep';
        let atHome = this.Services.LocTracker.isAtHome();
       
        this.curState.isSleeping = lightsOff && isDark && sleepFocusOn && atHome;

        if (this.curState.isSleeping === prevState) return;
        this.pushCurState();
    }
}





