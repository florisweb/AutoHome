
import { HomePagePanel } from '../../panel.jsx';
import { setTextToElement } from '../../extraFunctions.js';
import { Button, Slider } from '../../components.jsx';


export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 1.5],
        }, _service)
    }
    render() {
        let html = super.render();
        html.className += ' Stern hasIcon hasButtonBar';
        return html;
    }

    renderContent() {
       	this.html.subText = <div className='text subText'>0%</div>;
		this.html.intensitySlider = new Slider({
			min: 0, 
			max: 100,
			onInput: (_intensity) => {
				this.service.setIntensity(_intensity);
				this.#setIntensityUI(_intensity);
			}
		});

		this.html.icon = <img className='panelIcon' src='images/sternOn.png'></img>;
		let onlineIndicator = this.renderOnlineIndicator();
		this.updateData();

		return [
			this.html.icon,
			<div className='text panelTitle'>{this.service.name}</div>,
			onlineIndicator,
			this.html.subText,
			<div className='bottomBar'>
				{this.html.intensitySlider.render()}
			</div>
		];
    }
    #setIntensityUI(_intensity) {
    	let src = _intensity > 0 ? 'images/sternOn.png' : 'images/sternOff.png';
    	this.html.icon.setAttribute('src', src);
    	setTextToElement(this.html.subText, 'Intensity: ' + (_intensity ?? '-') + '%');
    	this.html.intensitySlider.value = _intensity;
    }

    updateData() {
        this.setOnlineState(this.service.state.deviceOnline);
        this.#setIntensityUI(this.service.state.sternIntensity);
    }
}

