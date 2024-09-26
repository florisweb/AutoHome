import { Service } from '../../service.jsx';
import panelConstructor from './panel.jsx';

export default new class extends Service {
	curState = {
		lampOn: false,
		sternIntensity: 0,
	};

	get iconSrc() {
		return this.curState.lampOn ? 'images/lightBolbOn.png' : 'images/lightBolbOff.png';
	}

	constructor() {
		super({
			id: 'CableLamp',
			name: 'Cable Lamp',
			iconSrc: 'images/lightBolbOn.png',
			panelConstructor: panelConstructor,
		});
	}

	onEvent(_event) {
		super.onEvent(_event);
		switch (_event.type)
		{
			case "lampStatus": 
				this.curState.lampOn = _event.data;
			break;
			case "sternIntensity": 
				this.curState.sternIntensity = _event.data;
			break;
		}
		this.panel.updateData();
	}
	onStateChange() {
		super.onStateChange(...arguments);
		this.panel.updateData();
	}

	toggleLight() {
		return this.setLampState(!this.curState.lampOn);
	}

	setLampState(_lampOn) {
		return this.send({type: "setLampState", data: _lampOn})
	}

	setSternIntensity(_intensity) {
		return this.send({type: 'setSternIntensity', data: _intensity})
	}
}