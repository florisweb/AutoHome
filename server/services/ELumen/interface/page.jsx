import { ServicePage } from '../../service.jsx';

export default class extends ServicePage {
    constructor(_service) {
        super({
            headerConfig: {
                pageIconInBox: true,    
            }
        }, _service);

        // this.moisturePanel = new function() {
        //     GraphPanel.call(this, {
        //         panelTitle: "Moisture", 
        //         size: [2, 3],
        //         xLabel: "Time", 
        //         yLabel: "Moisture (%)", 
        //         xRange: [Date.now() / 1000 -  60 * 60 * 24 * 5, Date.now() / 1000],
        //         yRange: [0, 100]
        //     });
        // }

        // this.waterVolumePanel = new function() {
        //     GraphPanel.call(this, {
        //         panelTitle: "Water Volume", 
        //         size: [2, 3],
        //         xLabel: "Time", 
        //         yLabel: "WaterVolume (%)", 
        //         xRange: [Date.now() / 1000 -  60 * 60 * 24 * 5, Date.now() / 1000],
        //         yRange: [0, 100]
        //     });
        // }

    }

    renderContent() {
        this.html.self = <div className='PanelBox'>
            {/*{this.moisturePanel.render()}*/}
            {/*{this.waterVolumePanel.render()}*/}
        </div>;

        this.service.send({type: 'getData'});

        return [
            ...super.renderContent(),
            this.html.self,
        ];
    }

    updateData() {

    }
    
    updateGraph(_data) {
        // this.#updateMoistureGraph(_data);
        // this.#updateWaterVolumeGraph(_data);
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
                row.data.moisture1
            ]);
            lines[2].push([
                time,
                row.data.moisture2
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
}










