import { Service } from '../../service.jsx';
import panelConstructor from './panel.jsx';

export default new class extends Service {

	constructor() {
		super({
			id: 'AutoCloud',
			name: 'AutoCloud',
			iconSrc: 'images/lightBolbOn.png',
			panelConstructor: panelConstructor,
		});
	}

	
	onStateChange() {
		super.onStateChange(...arguments);
		console.log('state chantged!');
		this.panel.updateData();
	}
}