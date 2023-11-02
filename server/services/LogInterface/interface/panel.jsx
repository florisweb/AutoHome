
import { SystemServicePagePanel } from '../../panel.jsx';
import { setTextToElement } from '../../extraFunctions.js';

export default class extends SystemServicePagePanel {
    constructor(_service) {
        super({
            size: [1, 1],
        }, _service)
    }
    render() {
        let html = super.render();
        html.className += ' LogInterface hasIcon';
        return html;
    }

    renderContent() {
        let icon = <img className='panelIcon' src='images/eLumenIcon.png'></img>;
        this.html.state = <div className='text subText waterPercentage'>x logs</div>;
        this.html.icon = icon;

        let sendForLogs = () => {
            this.service.getLogs().then((_result) => {
                if (_result === false) setTimeout(() => sendForLogs(), 100);
            });
        }
        sendForLogs();

        return [
            icon,
            this.html.state,
            <div className='text panelTitle'>{this.service.name}</div>,
        ];
    }

    async updateData(_data = []) {
        setTextToElement(this.html.state, _data.length + ' logs');
    }
}