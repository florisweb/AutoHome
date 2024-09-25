import { Service } from '../../service.jsx';
import { RequestMessage } from '../../server/message.js';

import panelConstructor from './panel.jsx';

export default new class extends Service {
	state = {
	};

	constructor() {
		super({
			id: 'PianoManager',
			name: 'Piano Manager',
			iconSrc: 'images/pianoManager.jpg',
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

	setLightningMode(_state) {
		return this.send({type: 'setLightningMode', data: _state})	
	}
	async getLightningState() {
		let message = new RequestMessage({serviceId: this.id, type: 'getLightningState'});
		return await message.send();
	}
}