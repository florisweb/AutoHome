import { Service } from '../../service.jsx';

export default new class extends Service {
	constructor() {
		super({
			id: 'SceneManager',
			name: 'Scene Manager',
		});
	}

	setCurScene(_sceneName) {
		return this.send({type: "activateScene", data: _sceneName})
	}
}
