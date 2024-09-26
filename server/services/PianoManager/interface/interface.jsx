import { Service } from '../../service.jsx';
import { RequestMessage } from '../../server/message.js';

import panelConstructor from './panel.jsx';

export default new class extends Service {
	
	constructor() {
		super({
			id: 'PianoManager',
			name: 'Piano Manager',
			iconSrc: 'images/pianoManager.jpg',
			panelConstructor: panelConstructor,
		});
	}

	onStateChange() {
		super.onStateChange(...arguments);
		this.panel.updateData();
	}

	setLightningMode(_state) {
		return this.send({type: 'setLightningMode', data: _state})	
	}
	async getLightningState() {
		let message = new RequestMessage({serviceId: this.id, type: 'getLightningState'});
		return await message.send();
	}
}