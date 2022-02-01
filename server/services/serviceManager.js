import ServiceConfig from './serviceConfig.js';
const Services = [];

export default new function() {
    this.setup = async function() {
        let promises = [];
        for (let id in ServiceConfig.services)
        {
            if (ServiceConfig.services[id].disabled) continue;
            promises.push(import('./' + id + '.js').then((mod) => {
                Services.push(mod.default);
            }));
        }
        await Promise.all(promises);
        for (let service of Services) service.setup();
        console.log("[ServiceManger] Loaded " + Services.length + "/" + Object.keys(ServiceConfig.services).length + " services.");
    }
    this.setup();

    this.getService = function(_id) {
        return Services.find((s) => s.id == _id);
    }

    this.getUIServices = function() {
        return Services.filter(_service => _service.config.hasUI);
    }
}