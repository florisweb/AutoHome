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
			id: 'ELumenManager',
			name: 'ELumenManager',
			iconSrc: 'images/eLumenIcon.png',
			panelConstructor: panelConstructor,
			pageConstructor: pageConstructor,
		});
	}

	onEvent(_event) {
		super.onEvent(_event);
	}

	onStateChange() {
		super.onStateChange(...arguments);
	}
}