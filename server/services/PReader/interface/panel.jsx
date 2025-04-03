
import { HomePagePanel } from '../../panel.jsx';
import { setTextToElement } from '../../extraFunctions.js';
import { Button, Slider } from '../../components.jsx';


export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 1],
        }, _service)
    }
    render() {
        let html = super.render();
        html.className += ' hasIcon';
        return html;
    }

    renderContent() {
    	this.html.subText = <div className='text subText'></div>;
		this.html.icon = <img className='panelIcon' src='images/sternOn.png'></img>;

		return [
			this.html.icon,
			<div className='text panelTitle'>{this.service.name}</div>,
			this.renderOnlineIndicator(),
			this.html.subText,
		];
    }

  

    updateData() {
    	if (!this.html.subText) return;
    }
}

