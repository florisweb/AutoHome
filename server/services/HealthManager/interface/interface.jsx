import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';
import pageConstructor from './page.jsx';

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
		switch (_event.type)
		{
			case "data": 
				this.panel.updateData(_event.data);
				this.page.updateData(_event.data);
			break;
		}
	}

	async getData() {
		let request = new RequestMessage({type: 'getData'}, this);
		let response = await request.send();
		this.panel.updateData(response.data);
		this.page.updateData(response.data);
		return response.data;
	}
}