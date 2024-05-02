
import { HomePagePanel } from '../../panel.jsx';
import { setTextToElement } from '../../extraFunctions.js';

export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 1],
        }, _service)
    }
    render() {
        let html = super.render();
        html.className += ' ELumen hasIcon';
        return html;
    }

    renderContent() {
        let icon = <img className='panelIcon' src='images/eLumenIcon.png'></img>;
        this.html.state = <div className='text subText waterPercentage'>? kCal</div>;
        this.html.icon = icon;

        return [
            icon,
            this.html.state,
            <div className='text panelTitle'>{this.service.name}</div>,
        ];
    }

    updateData(_data) {
        let totalKCals = _data.map(r => r.energy).reduce((a, b) => a + b, 0)
        setTextToElement(this.html.state, Math.round(totalKCals * 10) / 10 + 'kCal')
    }
}