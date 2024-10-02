import { Service } from '../../service.jsx';
import { RequestMessage } from '../../server/message.js';


export default new class extends Service {
	constructor() {
		super({
			id: 'ServerManager',
			name: 'Server Manager',
			iconSrc: 'images/settingsIcon.png',
		});
	}

	onEvent(_event) {
		super.onEvent(_event);
		if (_event.type === 'curState') ServiceManager.getServiceConditions();
	}
}
