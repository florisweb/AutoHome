import { ServicePage } from '../../service.jsx';
import { GraphPanel } from '../../panel.jsx';

export default class extends ServicePage {
    constructor(_service) {
        super({headerConfig: {}}, _service);

        this.moisturePanel = new GraphPanel({
            panelTitle: "Moisture", 
            size: [2, 3],
            xLabel: "Time", 
            yLabel: "Moisture (%)", 
            xRange: [Date.now() / 1000 -  60 * 60 * 24 * 5, Date.now() / 1000],
            yRange: [0, 100]
        });
        console.warn(window.t = this.moisturePanel)
        this.moisturePanel.updateLegend(['Humidity', 'Moisture'])

        // this.waterVolumePanel = new GraphPanel({
        //     panelTitle: "Water Volume", 
        //     size: [2, 3],
        //     xLabel: "Time", 
        //     yLabel: "WaterVolume (%)", 
        //     xRange: [Date.now() / 1000 -  60 * 60 * 24 * 5, Date.now() / 1000],
        //     yRange: [0, 100]
        // });
        this.temperaturePanel = new GraphPanel({
            panelTitle: "Temperature", 
            size: [2, 3],
            xLabel: "Time", 
            yLabel: "Temperature (*C)", 
            xRange: [Date.now() / 1000 -  60 * 60 * 24 * 5, Date.now() / 1000],
        });

        this.temperaturePanel.updateLegend(['Temperature'])
    }

    renderContent() {
        this.html.self = <div className='PanelBox'>
            {this.moisturePanel.render()}
            {this.temperaturePanel.render()}
        </div>;

        this.service.send({type: 'getData'});

        return [
            ...super.renderContent(),
            this.html.self,
        ];
    }

    updateData() {
        console.log('TODO', ...arguments);
    }
    
    updateGraph(_data) {
        this.#updateMoistureGraph(_data);
        // this.#updateWaterVolumeGraph(_data);
        this.#updateTemperatureGraph(_data);
    }

    #updateMoistureGraph(_data) {
        let lines = [[], [], [], []];
        for (let row of _data)
        {
            let time = row.time / 1000;
            lines[0].push([
                time,
                row.data.humidity
            ]);
            lines[1].push([
                time,
                row.data.moisture
            ]);
        }

        this.moisturePanel.setData(lines);
    }

    #updateWaterVolumeGraph(_data) {
        let lines = [[]];
        for (let row of _data)
        {
            let time = row.time / 1000;
            lines[0].push([
                time,
                row.data.volumePerc
            ]);
        }

        this.waterVolumePanel.setData(lines);
    }
    #updateTemperatureGraph(_data) {
        let lines = [[]];
        for (let row of _data)
        {
            let time = row.time / 1000;
            lines[0].push([
                time,
                row.data.temperature
            ]);
        }

        this.temperaturePanel.setData(lines);
    }
}










