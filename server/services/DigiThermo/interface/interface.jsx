import { Service } from '../../service.jsx';
import panelConstructor from './panel.jsx';

export default new class extends Service {
	constructor() {
		super({
			id: 'DigiThermo',
			name: 'DigiThermo',
			iconSrc: 'images/lightBolbOn.png',
			panelConstructor: panelConstructor,
		});
	}

	onStateChange() {
		super.onStateChange(...arguments);
		this.panel.updateData();
	}
}