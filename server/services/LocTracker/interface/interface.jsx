import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';

export default new class extends Service {
	constructor() {
		super({
			id: 'LocTracker',
			name: 'LocTracker',
			iconSrc: 'images/eLumenIcon.png',
			panelConstructor: panelConstructor,
		});
	}

	onStateChange() {
		super.onStateChange(...arguments);
		this.getNewTilesInLast4Weeks()
	}
	
	async getNewTilesInLast4Weeks() {
		let request = new RequestMessage({type: 'getNewTilesInLast4Weeks'}, this);
		let response = await request.send();
		this.panel.updateData(response.data);
		return response.data;
	}
}