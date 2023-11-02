import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';

export default new class extends Service {
	state = {
		sternIntensity: 0
	};

	get iconSrc() {
		return this.sternIntensity > 0 ? 'images/sternOn.png' : 'images/sternOff.png';
	}

	constructor() {
		super({
			id: 'SternInterface',
			name: 'Stern',
			iconSrc: 'images/sternOn.png',
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
			case "sternIntensity": 
				this.state.sternIntensity = _event.data;
				this.panel.updateData();
			break;
		}
	}


	setIntensity(_intensity) {
		return this.send({type: 'setSternIntensity', data: _intensity})
	}
}