import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';

export default new class extends Service {
	state = {};

	constructor() {
		super({
			id: 'HealthManager',
			name: 'HealthManager',
			iconSrc: 'images/eLumenIcon.png',
			panelConstructor: panelConstructor,
		});
	}

	onEvent(_event) {
		super.onEvent(_event);
		switch (_event.type)
		{
			case "data": 
				this.panel.updateData(_event.data);
			break;
		}
	}
	onStateChange() {
		super.onStateChange(...arguments);
		this.getData();
	}

	async getData() {
		let request = new RequestMessage({type: 'getData'}, this);
		let response = await request.send();
		this.panel.updateData(response.data);
		return response.data;
	}
}