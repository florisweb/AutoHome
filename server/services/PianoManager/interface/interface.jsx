import { Service } from '../../service.jsx';
import { RequestMessage } from '../../server/message.js';

import panelConstructor from './panel.jsx';

export default new class extends Service {
	state = {
	};

	get iconSrc() {
		return 'images/lightBolbOn.png';
	}

	constructor() {
		super({
			id: 'PianoManager',
			name: 'Piano Manager',
			iconSrc: 'images/lightBolbOn.png',
			panelConstructor: panelConstructor,
		});
	}

	onEvent(_event){
		switch (_event.type)
		{
			case "curState": 
				this.state = _event.data;
				this.panel.updateData();
			break;
		}
	}

	setLightningState(_state) {
		return this.send({type: 'setLightningState', data: _state})	
	}
	async getLightningState() {
		let message = new RequestMessage({serviceId: this.id, type: 'getLightningState'});
		return await message.send();
	}
}