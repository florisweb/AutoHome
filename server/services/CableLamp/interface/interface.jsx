import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';

export default new class extends Service {
	state = {
		lampOn: false
	};

	get iconSrc() {
		return this.state.lampOn ? 'images/lightBolbOn.png' : 'images/lightBolbOff.png';
	}

	constructor() {
		super({
			id: 'CableLamp',
			name: 'Cable Lamp',
			iconSrc: 'images/lightBolbOn.png',
			panelConstructor: panelConstructor,
		});
	}

	onEvent(_event){
		switch (_event.type)
		{
			case "curState": 
				this.state = _event.data;
				this.panel.setLampState(this.state.lampOn);
				this.panel.setOnlineState(this.state.deviceOnline);
			break;
			case "lampStatus": 
				this.state.lampOn = _event.data;
				this.panel.setLampState(this.state.lampOn); 
			break;
		}
	}


	toggleLight() {
		return this.setLampState(!this.state.lampOn);
	}

	setLampState(_lampOn) {
		return this.send({type: "setLampState", data: _lampOn})
	}
}