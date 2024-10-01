
import { HomePagePanel } from '../../panel.jsx';
import { setTextToElement, wait } from '../../extraFunctions.js';
import { DropDown } from '../../components.jsx';


export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 1],
        }, _service);
    }
    render() {
        let html = super.render();
        html.className += ' SceneManager hasIcon';
        return html;
    }

    renderContent() {
        this.sceneDropDown = new DropDown({
            onChange: (_value) => this.service.setCurScene(_value),
            options: []
        });

        wait(100).then(
            () => this.service.getScenes().then((_response) => {
                this.sceneDropDown.setOptions(_response.data.map(set => {return {value: set.id, name: set.name}}));
                this.sceneDropDown.setValue(this.service.curState.curSceneId);
            })
        );
        
		this.html.icon = <img className='panelIcon' src='images/pianoManager.jpg'></img>;
		return [
			this.html.icon,
			<div className='text panelTitle'>{this.service.name}</div>,
			this.sceneDropDown.render()
		];
    }
   

    updateData() {
    	if (!this.html.subText) return;
        this.sceneDropDown.setValue(this.service.curState.curSceneId);
    }
}
