import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';
import pageConstructor from './page.jsx';

export default new class extends Service {
	curState = {
		humidty: 0,
		temperature: 0,
	};

	constructor() {
		super({
			id: 'ELumen',
			name: 'ELumen',
			iconSrc: 'images/eLumenIcon.png',
			panelConstructor: panelConstructor,
			pageConstructor: pageConstructor,
		});
	}

	onEvent(_event) {
		super.onEvent(_event);
		switch (_event.type)
		{
			case "data": 
				this.page.updateGraph(_event.data);
			break;
		}
	}

	onStateChange() {
		super.onStateChange(...arguments);
		this.panel.updateData();
		this.page.updateData();
	}
}