
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
        html.className += ' LEDStrip hasIcon';
        return html;
    }

    renderContent() {
    	this.html.subText = <div className='text subText'></div>;
		this.html.colorInput = <input type='color' className='colorPicker' value='#f00'/>;
		this.html.colorInput.addEventListener('input', () => this.#onInput());
		this.html.icon = <img className='panelIcon' src='images/sternOn.png'></img>;

		return [
			this.html.icon,
			<div className='text panelTitle'>{this.service.name}</div>,
			this.renderOnlineIndicator(),
			this.html.subText,
			this.html.colorInput,
		];
    }

    #onInput() {
    	const base = 100;
    	let color = hexToRGB(this.html.colorInput.value, 1);
    	this.service.setBaseColor(color);
    }

    updateData() {
    	if (!this.html.subText) return;
    	this.html.colorInput.value = RGBToHex(this.service.curState.baseColor);
    }
}





function hexToRGB(_hex, _intensity = 1) {
	let number = parseInt('0x' + (_hex.split('#')[1]))
	return [
		((number & 0xff0000) >> 16) * _intensity,
		((number & 0x00ff00) >> 8) * _intensity,
		((number & 0x0000ff)) * _intensity
    ];
};

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function RGBToHex(_RGB) {
	return  "#" + _RGB.map(e => e.toString(16).padStart(2, 0)).join('');
}




