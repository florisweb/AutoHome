import CableLamp from './cableLamp.js';
import MovementTracker from './movementTracker.js';
import RouterManager from './routerManager.js';
const Services = [
    CableLamp,
    MovementTracker,
    RouterManager
];

export default new function() {
    this.getService = function(_id) {
        return Services.find((s) => s.id == _id);
    }
}