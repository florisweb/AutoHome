
import { HomePagePanel } from '../../panel.jsx';
import { setTextToElement, wait } from '../../extraFunctions.js';

export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 1.5],
        }, _service);
    }
    render() {
        let html = super.render();
        html.className += ' SceneManager hasIcon';
        return html;
    }

    renderContent() {
        this.sceneOptionHolder = <div className='sceneHolder'></div>;

        wait(200).then(() => this.updateData());
        
		this.html.icon = <img className='panelIcon' src='images/pianoManager.jpg'></img>;
		return [
			this.html.icon,
			<div className='text panelTitle'>{this.service.name}</div>,
            this.sceneOptionHolder
		];
    }
   

    updateData() {
    	if (!this.sceneOptionHolder) return;

        this.#updateSelectedSceneUI();
        this.service.getScenes().then((_response) => {
            this.sceneOptionHolder.innerHTML = '';
            for (let option of _response.data)
            {
                let element = <div className='scene' value={option.id} onclick={
                    () => {
                        this.service.setCurScene(element.value);
                        this.#updateSelectedSceneUI(element.value);
                    }
                }>{option.name}</div>
                if (option.id === this.service.curState.curSceneId) element.classList.add('selected');
                this.sceneOptionHolder.append(element);
            }
        });
    }

    #updateSelectedSceneUI(_curSceneId = this.service.curState.curSceneId) {
        if (!this.sceneOptionHolder) return;
        for (let child of this.sceneOptionHolder.children) {
            child.classList.toggle('selected', child.value === _curSceneId);
        }
    }
}
