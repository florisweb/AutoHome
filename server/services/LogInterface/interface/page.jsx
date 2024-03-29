import { ServicePage } from '../../service.jsx';
import { Panel } from '../../panel.jsx';

export default class extends ServicePage {
    constructor(_service) {
        super({headerConfig: {
            rightButtonSrc: false,
        }}, _service);

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
        this.html.holder = <div className='logHolder'></div>;
        this.#updateContent();
        return this.html.holder;
    }
    setData(_data) {
        this.#curData = _data;
        this.#updateContent();
    }

    #updateContent() {
        if (!this.html.holder) return;
        this.html.holder.innerHTML = '';
        for (let log of this.#curData)
        {   
            this.html.holder.append(this.#renderLogLine(log));
        }
    }
    #renderLogLine(_log) {
        let tagHolder = <div className='tagHolder'>{_log.tag}</div>;
        let r = (_log.tag.charCodeAt(0) - 65) * 6 + 50;
        let g = (_log.tag.charCodeAt(1) - 65) * 6 + 50;
        let b = (_log.tag.charCodeAt(2) - 65) * 6 + 50;
        let color = 'rgb(' + (isNaN(r) ? 200 : r) + ',' + (isNaN(g) ? 200 : g) + ',' + (isNaN(b) ? 200 : b) + ')';
        tagHolder.style.background = color;


        let date = new Date(_log.dateTime);
        let dateString = '[' + date.toString() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '] - ';

        return <div className={'logLine ' + (_log.content ? 'hasContent' : '')}>
            {tagHolder}
            <div className='messageHolder'>{dateString + _log.message}</div>
            <div className='contentHolder'>{JSON.stringify(_log.content)}</div>
        </div>;
    }
}





