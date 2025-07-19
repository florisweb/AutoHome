import { ServicePage } from '../../service.jsx';
import { Graph } from '../../components.jsx';
export default class extends ServicePage {
    constructor(_service) {
        super({headerConfig: {}}, _service);
    }

    renderContent() {
        let plants = [{
            name: "Merel's plant",
            type: "Ficus",
            isEmpty: false,
            typeCode: 0, 
            ownerServiceId: 'ELumenHub',
            plantIndex: 0,
        }, {
            name: "Merel's plant",
            type: "Ficus",
            isEmpty: true,
            typeCode: 0, 
            ownerServiceId: 'ELumenHub',
            plantIndex: 1,
        }];

        let plantPanels = plants.map(r => this.#renderPlantPanel(r));
        this.html.self = <div className='PanelBox'>
            <div className="plantPanelHolder">
                {plantPanels}
            </div>
        </div>;

        return [
            ...super.renderContent(),
            this.html.self,
        ];
    }

    updateData() {
        console.log('TODO', ...arguments);
    }
    #renderPlantPanel(_plant) {
        let moistureGraph = new Graph({
            xLabel: 'Time', yLabel: 'Moisture (%)', yRange: [0, 100]
        });
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
            <div className="moistureGraphHolder">
                { moistureGraph.render() }
            </div>
        </div>
        panel.classList.toggle('isEmpty', _plant.isEmpty);


        return panel;
    }
}










