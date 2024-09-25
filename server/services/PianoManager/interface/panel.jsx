
import { HomePagePanel } from '../../panel.jsx';
import { setTextToElement } from '../../extraFunctions.js';
import { DropDown } from '../../components.jsx';


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
        this.lightningModeDropDown = new DropDown({
            onChange: (_value) => this.service.setLightningMode(_value),
            options: [
                {
                    name: 'Sustain',
                    value: 'sustain'
                },
                {
                    name: 'Key Press',
                    value: 'keypress'
                }, 
                {
                    name: 'Off',
                    value: 'off'
                }
            ]
        });
        
		this.html.icon = <img className='panelIcon' src='images/pianoManager.jpg'></img>;
		return [
			this.html.icon,
			<div className='text panelTitle'>{this.service.name}</div>,
			this.renderOnlineIndicator(),
			this.html.subText,
			this.lightningModeDropDown.render()
		];
    }
   

    updateData() {
    	if (!this.html.subText) return;
    	this.setOnlineState(this.service.state.pianoConnected);
        this.lightningModeDropDown.setValue(this.service.state.lightningMode);
    }
}
