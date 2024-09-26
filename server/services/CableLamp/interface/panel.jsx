
import { HomePagePanel } from '../../panel.jsx';
import { setTextToElement } from '../../extraFunctions.js';
import { Button, Slider } from '../../components.jsx';


export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 2.4],
        }, _service)
    }
    render() {
        let html = super.render();
        html.className += ' CableLamp hasIcon hasButtonBar';
        return html;
    }

    renderContent() {
    	let content = [this.renderSternPanel(), this.renderCablePanel()];
    	this.updateData();
    	return content;
    }

    renderCablePanel() {
    	this.html.lampStatus = <div className='text subText'>lamp off</div>;
		let toggleButton = new Button({
			text: "Toggle",
			onclick: (_e) => {
				this.service.toggleLight();
				_e.stopPropagation();
			}
		});

		this.html.lightBolbIcon = <img className='panelIcon' src='images/lightBolbOn.png'></img>;
		return <div className='cablePanel Panel animateIn hasIcon'>
			{this.html.lightBolbIcon}
			<div className='text panelTitle'>{this.service.name}</div>
			{this.html.lampStatus}
			<div className='bottomBar'>
				{toggleButton.render()}
			</div>
		</div>
    }


    renderSternPanel() {
    	this.html.subText = <div className='text subText'>0%</div>;
		this.html.intensitySlider = new Slider({
			min: 0, 
			max: 100,
			onInput: (_intensity) => {
				this.service.setSternIntensity(_intensity);
				this.setSternIntensity(_intensity);
			}
		});

		this.html.icon = <img className='panelIcon' src='images/sternOn.png'></img>;

		return <div className='sternPanel Panel animateIn hasIcon'>
			{this.html.icon}
			<div className='text panelTitle'>Stern</div>
			{this.renderOnlineIndicator()}
			{this.html.subText}
			<div className='bottomBar'>
				{this.html.intensitySlider.render()}
			</div>
		</div>
    }

    updateData() {
    	this.setLampState(this.service.curState.lampOn);
        this.setSternIntensity(this.service.curState.sternIntensity);
    }

	setLampState(_lampOn) {
		if (!this.html.lampStatus) return;
		setTextToElement(this.html.lampStatus, _lampOn ? "Lamp On" : "Lamp Off");
		this.html.lightBolbIcon.setAttribute('src', "images/lightBolb" + (_lampOn ? "On" : "Off") + ".png");
	}
	
	setSternIntensity(_intensity) {
    	if (!this.html.icon) return;
    	let src = _intensity > 0 ? 'images/sternOn.png' : 'images/sternOff.png';
    	this.html.icon.setAttribute('src', src);
    	setTextToElement(this.html.subText, 'Intensity: ' + (_intensity ?? '-') + '%');
    	this.html.intensitySlider.value = _intensity;
    }
}


