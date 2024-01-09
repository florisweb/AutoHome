
import { HomePagePanel } from '../../panel.jsx';

export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 1],
        }, _service)
    }
    render() {
        let html = super.render();
        html.className += ' hasIcon';
        html.addEventListener('click', () => window.location.replace('/x'));
        return html;
    }

    renderContent() {
        let icon = <img className='panelIcon' src='images/eLumenIcon.png'></img>;
        let state = <div className='text subText waterPercentage'>&#128167;x new tiles in last month</div>;
        this.html.icon = icon;

        return [
            icon,
            state,
            <div className='text panelTitle'>{this.service.name}</div>,
        ];
    }
}