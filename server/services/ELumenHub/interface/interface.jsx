import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';

export default new class extends Service {
	constructor() {
		super({
			id: 'ELumenHub',
			name: 'ELumen Hub',
			iconSrc: 'images/eLumenIcon.png',
			panelConstructor: panelConstructor,
		});
	}

	onEvent(_event) {
		super.onEvent(_event);
	}

	onStateChange() {
		super.onStateChange(...arguments);
	}
}