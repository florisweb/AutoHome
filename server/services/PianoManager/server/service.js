
import easymidi from 'easymidi';
import { Service } from '../../../serviceLib.js';


export default class extends Service {
    #reConnectInterval = 15 * 1000;
    #LEDStripService;

    constructor({id, config}) {
        super(arguments[0]);
        this.attachPiano();
    }

    attachPiano() {
        let pianoDevice = this.getPianoMidiDevice();
        if (!pianoDevice) return setTimeout(() => this.attachPiano(), this.#reConnectInterval);
        this.resolveOnDisconnect().then(() => setTimeout(() => this.attachPiano(), this.#reConnectInterval));

        let curLEDBatch = [];
        let handleOnNote = (msg, _on) => {
            let rgb = HSVtoRGB(Math.max(Math.min(msg.velocity / 100, 1), 0), 1, 1);
            if (!_on) rgb = [0, 0, 0];
            curLEDBatch.push(msg.note * 2, ...rgb);
            curLEDBatch.push(msg.note * 2 + 1, ...rgb);

            setTimeout(() => {
                this.sendLEDData(curLEDBatch);
                curLEDBatch = [];
            }, 1);
        }
        pianoDevice.on('noteon', (msg) => handleOnNote(msg, true));
        pianoDevice.on('noteoff', (msg) => handleOnNote(msg, false));
    }

    getPianoMidiDevice() {
        let deviceName = this.#getPianoMidiDeviceName();
        try {
            return new easymidi.Input(deviceName);
        } catch {
            return false;
        }
    }

    #getPianoMidiDeviceName() {
        if (this.config.preDefinedDeviceName) return this.config.preDefinedDeviceName;
        let devices = easymidi.getInputs();
        return devices[0];
    }

    resolveOnDisconnect() {
        return new Promise((resolve) => {
            let checkLoop = () => {
                let device = this.getPianoMidiDevice()
                if (!device) return resolve();
                setTimeout(checkLoop, this.#reConnectInterval);
            };
        })

    }


    onLoadRequiredServices({LEDStrip}) {
        if (!LEDStrip) return console.error(`${this.serviceId}: Error while loading, LEDStrip not found`);
        this.#LEDStripService = LEDStrip;  
    }

    sendLEDData(_RGBData) {
        if (!this.#LEDStripService) return;
        this.#LEDStripService.send({type: 'setLEDs', data: _RGBData});
    }
}




function HSVtoRGB(h, s, v) {
    let r = 0;
    let g = 0;
    let b = 0;
    let i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ]
}



