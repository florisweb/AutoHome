import { Service } from '../../service.jsx';

import panelConstructor from './panel.jsx';

export default new class extends Service {
	constructor() {
		super({
			id: 'CameraManager',
			name: 'Camera Manager',
			iconSrc: 'images/eLumenIcon.png',
			panelConstructor: panelConstructor,
		});
	}

	onEvent(_event) {
		super.onEvent(_event);
		switch (_event.type)
		{
			case "newImageUploaded": 
				this.panel.refreshImage();
			break;
		}
	}
}