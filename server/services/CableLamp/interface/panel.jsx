
import { HomePagePanel } from '../../panel.jsx';
import { setTextToElement } from '../../extraFunctions.js';
import { Button } from '../../components.jsx';


export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 1],
        }, _service)
    }
    render() {
        let html = super.render();
        html.className += ' CableLamp hasIcon hasButtonBar';
        return html;
    }

    renderContent() {
       	this.html.lampStatus = <div className='text subText'>lamp off</div>;
		let toggleButton = new Button({
			text: "Toggle",
			onclick: (_e) => {
				this.service.toggleLight();
				_e.stopPropagation();
			}
		});

		this.html.lightBolbIcon = <img className='panelIcon' src='images/lightBolbOn.png'></img>;
		this.updateData();
		return [
			this.html.lightBolbIcon,
			<div className='text panelTitle'>{this.service.name}</div>,
			this.html.lampStatus,
			<div className='bottomBar'>
				{toggleButton.render()}
			</div>
		];
    }

    updateData() {
    	this.setLampState(this.service.state.lampOn);
    }

	setLampState(_lampOn) {
		if (!this.html.lampStatus) return;
		setTextToElement(this.html.lampStatus, _lampOn ? "Lamp On" : "Lamp Off");
		this.html.lightBolbIcon.setAttribute('src', "images/lightBolb" + (_lampOn ? "On" : "Off") + ".png");
	}
}

