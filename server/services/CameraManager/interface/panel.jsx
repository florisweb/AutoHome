
import { HomePagePanel } from '../../panel.jsx';
import { wait } from '../../extraFunctions.js';

export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 3],
        }, _service)
    }
    render() {
        let html = super.render();
        html.className += ' CameraManager';
        return html;
    }

    renderContent() {
        this.html.imageHolder = <img className='imageHolder' src='CameraManager/latestImage'></img>;
        return [
            this.html.imageHolder

        ];
    }

    async refreshImage() {
        // https://stackoverflow.com/questions/1077041/refresh-image-with-a-new-one-at-the-same-url
        await fetch("CameraManager/latestImage", { cache: 'reload', mode: 'no-cors' }) // Re-fetch to clear cache
        this.html.imageHolder.setAttribute('src', '');
        await wait(1);
        this.html.imageHolder.setAttribute('src', 'CameraManager/latestImage');
    }
}