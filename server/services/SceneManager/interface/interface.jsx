import { Service } from '../../service.jsx';
import { RequestMessage } from '../../server/message.js';

import panelConstructor from './panel.jsx';

export default new class extends Service {
	constructor() {
		super({
			id: 'SceneManager',
			name: 'Scene Manager',
			iconSrc: 'images/pianoManager.jpg',
			panelConstructor: panelConstructor,
		});
	}

	setCurScene(_sceneId) {
		return this.send({type: "activateScene", data: _sceneId})
	}
	async getScenes() {
		let request = new RequestMessage({type: 'getScenes'}, this);
		return await request.send();
	}
}
