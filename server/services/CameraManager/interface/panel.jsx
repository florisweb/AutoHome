
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
        this.refreshImage();
        return html;
    }

    async refreshImage() {
        // https://stackoverflow.com/questions/1077041/refresh-image-with-a-new-one-at-the-same-url
        await fetch("CameraManager/latestImage", { cache: 'reload', mode: 'no-cors' }) // Re-fetch to clear cache
        this.html.self.style.background = 'url("") 0% 0% / cover no-repeat';
        await wait(0);
        this.html.self.style.background = 'url("CameraManager/latestImage") 0% 0% / cover no-repeat';
    }
}