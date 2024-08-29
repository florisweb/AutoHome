import { Service } from '../../service.jsx';
import panelConstructor from './panel.jsx';

export default new class extends Service {
	state = {
	};

	get iconSrc() {
		return 'images/lightBolbOn.png';
	}

	constructor() {
		super({
			id: 'LEDStrip',
			name: 'LED Strip',
			iconSrc: 'images/lightBolbOn.png',
			panelConstructor: panelConstructor,
		});
	}

	onEvent(_event){
		switch (_event.type)
		{
			case "curState": 
				this.state = _event.data;
				this.panel.updateData();
			break;
		}
	}

	setColor(_rgb) {
		return this.send({type: 'setColor', data: _rgb})	
	}
}