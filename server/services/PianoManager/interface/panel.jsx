
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
        html.className += ' PianoManager hasIcon';
        return html;
    }

    renderContent() {
    	this.html.subText = <div className='text subText'>
    		<div class='curColorIndicator'></div>
    	</div>;
		this.html.colorInput = <input type='color' className='colorPicker' value='#f00'/>;
		this.html.colorInput.addEventListener('input', () => this.#onInput());
		this.html.icon = <img className='panelIcon' src='images/sternOn.png'></img>;
		let onlineIndicator = this.renderOnlineIndicator();

		return [
			this.html.icon,
			<div className='text panelTitle'>{this.service.name}</div>,
			onlineIndicator,
			this.html.subText,
			this.html.colorInput,
		];
    }

    #onInput() {
    	const base = 100;
    	let color = hexToRGB(this.html.colorInput.value, 1);
    	this.service.setColor(color);
    }

    updateData() {
    	if (!this.html.subText) return;
    	this.html.subText.children[0].style.background = '#f00';
    	this.setOnlineState(this.service.state.deviceOnline);
    }
}
