import { Service } from '../../service.jsx';
import panelConstructor from './panel.jsx';

export default new class extends Service {
	constructor() {
		super({
			id: 'LEDStrip',
			name: 'LED Strip',
			iconSrc: 'images/lightBolbOn.png',
			panelConstructor: panelConstructor,
		});
	}

	onStateChange() {
		super.onStateChange(...arguments);
		this.panel.updateData();
	}

	setBaseColor(_rgb) {
		return this.send({type: 'setBaseColor', data: _rgb})	
	}
}