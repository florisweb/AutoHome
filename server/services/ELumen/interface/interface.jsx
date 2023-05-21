import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';
// import pageConstructor from './page.jsx';


export default new class extends Service {
	state = {
		humidty: 0,
		temperature: 0,
	};

	constructor() {
		super({
			id: 'ELumen',
			name: 'eLumen',
			panelConstructor: panelConstructor,
			// pageConstructor: pageConstructor,
		});
	}

	onEvent(_event){
		switch (_event.type)
		{
			case "curState": 
				this.state = _event.data;
				this.homeScreenPanel.updateData();
				this.servicePage.updateData();
			break;
			case "data": 
				this.servicePage.updateGraph(_event.data);
			break;
		}
	}
}