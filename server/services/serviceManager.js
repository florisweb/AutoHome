const Services = [
    require('./cableLamp.js').service,
    require('./movementTracker.js').service,
    require('./routerManager.js').service
];

exports.ServiceManager = new function() {
    this.getService = function(_id) {
        return Services.find((s) => s.id == _id);
    }
}