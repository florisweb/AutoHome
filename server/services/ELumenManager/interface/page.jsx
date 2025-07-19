import { ServicePage } from '../../service.jsx';
import { Graph } from '../../components.jsx';

export default class extends ServicePage {
    constructor(_service) {
        super({headerConfig: {}}, _service);
    }

    renderContent() {
        this.html.plantPanelHolder = <div className="plantPanelHolder"></div> ;
        this.html.self = <div className='PanelBox ELumenManager'>
            { this.html.plantPanelHolder }
        </div>;
        this.#updatePlants();

        return [
            ...super.renderContent(),
            this.html.self,
        ];
    }

    updateData() {
        console.log('TODO', ...arguments);
        this.#updatePlants();
    }
    
    #updatePlants() {
        //      let plants = [{
        //     name: "Merel's plant",
        //     type: "Ficus",
        //     isEmpty: false,
        //     typeCode: 0, 
        //     ownerServiceId: 'ELumenHub',
        //     plantIndex: 0,
        // }, {
        //     name: "Merel's plant",
        //     type: "Ficus",
        //     isEmpty: true,
        //     typeCode: 0, 
        //     ownerServiceId: 'ELumenHub',
        //     plantIndex: 1,
        // }];

        this.html.plantPanelHolder.innerHTML = '';
        for (let plant of this.service.curState?.plants)
        {
            let panel = this.#renderPlantPanel(plant);
            this.html.plantPanelHolder.append(panel);
        }
    }

    #renderPlantPanel(_plant) {
        let moistureGraph = new Graph({
            xLabel: 'Time', 
            yLabel: 'Moisture (%)', 
            yRange: [0, 100],
            xRange: [Date.now() / 1000 - 60 * 60 * 24 * 3, Date.now() / 1000],
        });

        this.#updateMoistureGraph(_plant.id, moistureGraph);
        let panel = <div className="plantPanel">
            <div className="graphicHolder"></div>
            <div className="moistureValueHolder">
                Moisture
                <div className="value">50%</div>
            </div>
            <div className="moistureValueHolder target">
                Target
                <div className="value">50%</div>
            </div>
            <div className="title">{_plant.name}</div>
            <div className="title subTitle">{_plant.type}</div>
            <div className="extraInfoHolder">
                average water usage: mL/day 
                total water: L
            </div>
            { moistureGraph.render() }
        </div>
        panel.classList.toggle('isEmpty', !!_plant.isEmpty);

        return panel;
    }

    async #updateMoistureGraph(_plantId, _graph) {
        let data = await this.service.getMoistureData(_plantId);
        if (!data) return;
        _graph.setData([
            data.map(r => [r.time / 1000, r.value])
        ]);
    }
}










