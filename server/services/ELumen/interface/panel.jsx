
import { HomePagePanel } from '../../panel.jsx';

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
        let state = <div className='text subText waterPercentage'>&#128167;52% filled</div>;
        this.html.icon = icon;

        let onlineIndicator = this.renderOnlineIndicator();
        this.setOnlineState(this.service.state.deviceOnline);

        return [
            icon,
            state,
            <div className='text panelTitle'>{this.service.name}</div>,
            onlineIndicator,
        ];
    }

    updateData() {
        this.setOnlineState(this.service.state.deviceOnline);
    }
}