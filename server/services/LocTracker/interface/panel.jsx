
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
        html.className += ' hasIcon';
        html.addEventListener('click', () => window.location.replace('/LocTracker'));
        return html;
    }

    renderContent() {
        let icon = <img className='panelIcon' src='images/eLumenIcon.png'></img>;
        this.html.state = <div className='text subText waterPercentage'>? new tiles in the last 4 weeks</div>;
        this.html.icon = icon;

        return [
            icon,
            this.html.state,
            <div className='text panelTitle'>{this.service.name}</div>,
        ];
    }

    updateData(_newTileCount) {
        if (!this.html.state) return;
        setTextToElement(this.html.state, _newTileCount + ' new tiles in the last 4 weeks')
    }
}