import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';
import pageConstructor from './page.jsx';

export default new class extends Service {
	state = {};

	constructor() {
		super({
			id: 'LogInterface',
			name: 'Logger',
			iconSrc: 'images/eLumenIcon.png',
			panelConstructor: panelConstructor,
			pageConstructor: pageConstructor,
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

	async getLogs() {
		return this.send({type: 'getLogs'});
	}
}