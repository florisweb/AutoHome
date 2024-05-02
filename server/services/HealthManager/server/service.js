
import { Subscriber, Service, ServiceFileManager } from '../../../serviceLib.js';
import Logger from '../../../logger.js';



function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});

    async function handleRequest(_message) {
        if (!_message.isRequestMessage) return;
        switch (_message.type)
        {
            case "getData": 
                return _message.respond({
                    type: 'data',
                    data: await This.service.dataManager.getData()
                })
        }
    }
}


export default class extends Service {
    dataManager = new (function(_service) {
        let fm = new ServiceFileManager({path: "activeEnergy.json", defaultValue: []}, _service);
        this.setData = (_data) => {
            return fm.writeContent(_data);
        }
        this.getData = function() {
            return fm.getContent();
        }
    })(this);

    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);
    }

    onLoadRequiredServices({ShortCutAPI}) {
        if (!ShortCutAPI) return console.error(`${this.serviceId}: Error while loading, ShortCutAPI not found`);
        ShortCutAPI.subscribe({
            acceptorService: this,
            onEvent: async (_data) => {
                if (_data.type === 'curState') return; // Initialization packet
                try {
                    let data = await this.dataManager.getData()
                    let newData = this.#parseEnergyData(_data)
                    for (let point of newData)
                    {
                        if (data.find((item) => item.startDate == point.startDate && item.endDate == point.endDate && item.energy == point.energy)) continue;
                        data.push(point)
                    }

                    this.dataManager.setData(data)
                } catch (e) {
                    Logger.log(e)
                }
            }
        })
    }
    #parseEnergyData(_data) {
        let items = [];
        let energyParts = _data.energy.split('\n')
        let startDateParts = _data.start.split('\n')
        let endDateParts = _data.end.split('\n')
        for (let i = 0; i < energyParts.length; i++)
        {
            items.push({
                energy: parseFloat(energyParts[i]),
                endDate: this.#timeStrToDate(startDateParts[i]).getTime(),
                startDate: this.#timeStrToDate(endDateParts[i]).getTime(),
            });
        }

        return items;
    }

    #timeStrToDate(_timeStr) {
        return new Date(_timeStr.split(' at ').join(' '));
    }
}










