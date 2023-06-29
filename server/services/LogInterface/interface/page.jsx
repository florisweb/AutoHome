import { ServicePage } from '../../service.jsx';
import { Panel } from '../../panel.jsx';

export default class extends ServicePage {
    constructor(_service) {
        super({headerConfig: {}}, _service);

        this.logPanel = new LogPanel();
    }


    renderContent() {
        this.html.self = <div className='PanelBox'>
            {this.logPanel.render()}
        </div>;

        this.service.getLogs();

        return [
            ...super.renderContent(),
            this.html.self,
        ];
    }

    updateData(_data) {
        this.logPanel.setData(_data);
    }
}


class LogPanel extends Panel {
    html = {};
    #curData = [];
    constructor() {
        super({
            size: [3, 5],
        });
    }
    renderContent() {
        this.html.holder = <div></div>;
        this.#updateContent();
        return this.html.holder;
    }
    setData(_data) {
        this.#curData = _data;
        this.#updateContent();
    }

    #updateContent() {
        this.html.holder.innerHTML = this.#curData.map((row) => '[' + row.tag + ']: ' + row.message + ' (' + JSON.stringify(row.content) + ')').join('<br><br>');
    }
}

