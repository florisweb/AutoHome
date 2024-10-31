import easymidi from 'easymidi';
import { Subscriber, Service, ServiceState } from '../../../serviceLib.js';



function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});

    async function handleRequest(_message) {
        switch (_message.type)
        {
            case "setLightningMode": 
                This.service.lightningMode = _message.data;
                break;
            case "getLightningMode": 
                if (!_message.isRequestMessage) return;
                return _message.respond({
                    type: 'lightningMode',
                    data: This.service.lightningMode
                });
        }
    }
}



export default class extends Service {
    curState = new ServiceState({
        pianoConnected: false,
        lightningMode: 'sustain' // Sustain, keypress, off
    });

    #reConnectInterval = 500;
    #LEDStripService;
    #LEDIndexRange = [224, 299];
    #NoteIndexRange = [21, 108];
    #sustainedKeys = []; // [key, velocity, time]
    #loopFrequency = 20; // ms per loop

    #sustainDuration = 3000;
    #sustainOn = false;

    #NoteCount = this.#NoteIndexRange[1] - this.#NoteIndexRange[0];
    #LEDCount = this.#LEDIndexRange[1] - this.#LEDIndexRange[0];
    #LEDsPerNote = 3;
    
    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
        this.attachPiano();
    }

    
    get lightningMode() {
        return this.curState.lightningMode;
    }
    set lightningMode(_mode) {
        if (_mode === "sustain") 
        {
            this.curState.lightningMode = "sustain";
        } else {
            for (let key of this.#sustainedKeys) key.duration = this.#loopFrequency + 1; // Turn all sustained keys off when 
        }
        this.curState.lightningMode = _mode;
        this.pushCurState();
    }

    attachPiano() {
        let pianoDevice = this.getPianoMidiDevice();
        if (!pianoDevice) return setTimeout(() => this.attachPiano(), this.#reConnectInterval);
        this.#onPianoConnectStateChange(true);
        this.resolveOnDisconnect().then(() => {
            pianoDevice.close();
            this.#onPianoConnectStateChange(false);
            setTimeout(() => this.attachPiano(), this.#reConnectInterval);
        });


        let curLEDBatch = [];
        let handleOnNote = (msg, _on) => {
            let rgb = HSVtoRGB(Math.max(Math.min(msg.velocity / 100, 1), 0), 1, 1);
            if (!_on) rgb = [0, 0, 0];

            let percNote = 1 - (msg.note - this.#NoteIndexRange[0]) / this.#NoteCount;
            let index = Math.floor(this.#LEDIndexRange[0] + this.#LEDCount * percNote);

            for (let i = 0; i < this.#LEDsPerNote; i++)
            {
                curLEDBatch.push(index + i, ...rgb);
            }

            setTimeout(() => {
                this.sendLEDData(curLEDBatch);
                curLEDBatch = [];
            }, 5);
        }
        

        pianoDevice.on('noteon', (msg) => {
            if (this.curState.lightningMode === "keypress") return handleOnNote(msg, true);
            if (this.curState.lightningMode !== "sustain") return;

            this.#sustainedKeys = this.#sustainedKeys.filter((key) => key.note !== this.#NoteIndexRange[1] - msg.note); // Prevent doubles

            let trueDuration = this.#sustainDuration * (msg.velocity / 125);
            let noteIndex = this.#NoteIndexRange[1] - msg.note;
            this.#sendKeyInfoToDevice(noteIndex, msg.velocity, trueDuration)

            this.#sustainedKeys.push({
                note: noteIndex,
                velocity: msg.velocity,
                startedUnderSustain: this.#sustainOn,
                released: false,
            });
        });

        pianoDevice.on('noteoff', (msg) => {
            if (this.curState.lightningMode === "keypress") return handleOnNote(msg, false);
            if (this.curState.lightningMode !== "sustain") return;

            let key = this.#sustainedKeys.find((_key) => _key.note === this.#NoteIndexRange[1] - msg.note); 
            if (!key) return;
            key.released = true;

            if (this.#sustainOn) key.startedUnderSustain = true;
            if (key.startedUnderSustain) return; // Don't turn off if started under sustain
            this.#sendKeyInfoToDevice(key.note, key.velocity, 1);
            this.#sustainedKeys = this.#sustainedKeys.filter((key) => key.note !== this.#NoteIndexRange[1] - msg.note)
        });

        pianoDevice.on('cc', (msg) => {
            if (this.curState.lightningMode !== "sustain") return;
            if (msg.controller !== 64) return; // Not sustain
            this.#sustainOn = msg.value > 70;// 0 - 127
            
            if (this.#sustainOn) return;
            let sustainedKeys = this.#sustainedKeys.filter(_key => _key.startedUnderSustain && _key.released); 
            this.#sustainedKeys = this.#sustainedKeys.filter(_key => !_key.startedUnderSustain || !_key.released)
            for (let key of sustainedKeys) this.#sendKeyInfoToDevice(key.note, key.velocity, 1);
        });
    }

    #curKeyBatch = [];
    #curReq;
    #sendKeyInfoToDevice(_index, _velocity, _duration) {
        this.#curKeyBatch = this.#curKeyBatch.concat([_index, _velocity, _duration]);
        if (this.#curReq) return;
        this.#curReq = setTimeout(() => {
            this.sendKeyData(this.#curKeyBatch);
            this.#curKeyBatch = [];
            this.#curReq = false;
        }, 5);
    }

   
    getPianoMidiDevice() {
        let deviceName = this.#getPianoMidiDeviceName();
        if (!deviceName) return false;
        try {
            return new easymidi.Input(deviceName);
        } catch {
            return false;
        }
    }

    #getPianoMidiDeviceName() {
        return easymidi.getInputs()[0];
    }

    resolveOnDisconnect() {
        return new Promise((resolve) => {
            let checkLoop = () => {
                if (!this.#getPianoMidiDeviceName()) return resolve();
                setTimeout(checkLoop, this.#reConnectInterval);
            };
            checkLoop();
        })
    }

    #onPianoConnectStateChange(_online) {
        this.curState.pianoConnected = _online;
        if (this.#LEDStripService) this.#LEDStripService.send({type: 'setPianoOnlineState', data: _online});
        this.pushCurState();
    }


    onLoadRequiredServices({LEDStrip}) {
        if (!LEDStrip) return console.error(`${this.serviceId}: Error while loading, LEDStrip not found`);
        this.#LEDStripService = LEDStrip;  
    }

    sendLEDData(_RGBData) {
        if (!this.#LEDStripService) return;
        this.#LEDStripService.send({type: 'setLEDs', data: _RGBData});
    }
    sendKeyData(_keyData) {
        if (!this.#LEDStripService || !_keyData.length) return;
        this.#LEDStripService.send({type: 'setPianoKeys', data: _keyData});
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



