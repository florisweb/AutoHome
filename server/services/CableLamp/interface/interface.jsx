import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';
import pageConstructor from './page.jsx';

export default new class extends Service {
	state = {
		lampOn: false
	};

	get iconSrc() {
		return this.state.lampOn ? 'images/lightBolbOn.png' : 'images/lightBolbOff.png';
	}

	programs = [];

	constructor() {
		super({
			id: 'CableLamp',
			name: 'Cable Lamp',
			iconSrc: 'images/lightBolbOn.png',
			panelConstructor: panelConstructor,
			pageConstructor: pageConstructor,
		});
	}

	onEvent(_event){
		switch (_event.type)
		{
			case "onlineStatusUpdate": 
				this.state.deviceOnline = _event.data;
				this.homeScreenPanel.setOnlineState(this.state.deviceOnline);
			break;
			case "curState": 
				this.state = _event.data;
				this.servicePage.updateContent();
				this.homeScreenPanel.setLampState(this.state.lampOn);
				this.homeScreenPanel.setOnlineState(this.state.deviceOnline);
				this.homeScreenPanel.setPreparedProgramIndicator(this.state.alarm);
			break;
			case "lampStatus": 
				this.state.lampOn = _event.data;
				this.homeScreenPanel.setLampState(this.state.lampOn); 
				this.servicePage.setLampState(this.state.lampOn);
			break;
			case "programs": 
				this.programs = _event.data;
				this.servicePage.updateContent();
			break;
		}
	}


	toggleLight() {
		return this.setLampState(!this.state.lampOn);
	}

	setLampState(_lampOn) {
		return this.send({type: "setLampState", data: _lampOn})
	}
}