
import { HomePagePanel } from '../../panel.jsx';
import { setTextToElement } from '../../extraFunctions.js';
import { Button } from '../../components.jsx';


export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 2],
        }, _service)
    }
    render() {
        let html = super.render();
        html.className += ' CableLamp hasIcon hasButtonBar';
        return html;
    }

    renderContent() {
       	this.html.subText = <div className='text subText'>0%</div>;
		let toggleButton = new Button({
			text: "Toggle",
			onclick: (_e) => {
				this.service.setIntensity(this.service.state.sternIntensity > 0 ? 0 : 100);
				this.#setIntensityUI(this.service.state.sternIntensity > 0 ? 0 : 100);
				_e.stopPropagation();
			}
		});

		this.html.lightBolbIcon = <img className='panelIcon' src='images/sternOn.png'></img>;
		let onlineIndicator = this.renderOnlineIndicator();
		this.updateData();

		return [
			this.html.lightBolbIcon,
			<div className='text panelTitle'>{this.service.name}</div>,
			onlineIndicator,
			this.html.subText,
			<div className='bottomBar'>
				{toggleButton.render()}
			</div>
		];
    }
    #setIntensityUI(_intensity) {
    	let src = _intensity > 0 ? 'images/sternOn.png' : 'images/sternOff.png';
    	this.html.lightBolbIcon.setAttribute('src', src);
    	setTextToElement(this.html.subText, 'Intensity: ' + (_intensity ?? '-') + '%');
    }

    updateData() {
        this.setOnlineState(this.service.state.deviceOnline);
        this.#setIntensityUI(this.service.state.sternIntensity);
    }
}

