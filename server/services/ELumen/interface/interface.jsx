import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';
import pageConstructor from './page.jsx';

export default new class extends Service {
	state = {
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

	onEvent(_event){
		switch (_event.type)
		{
			case "curState": 
				this.state = _event.data;
				this.panel.updateData();
				this.page.updateData();
			break;
			case "data": 
				this.page.updateGraph(_event.data);
			break;
		}
	}
}