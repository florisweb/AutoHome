const ServiceKeys = require('./serviceKeyManager.js').keys;


function Service({id}) {
    this.subscribers = [];
    this.id = id;
    this.key = ServiceKeys[id];
    
    this.authenticate = (_key) => {
        if (!this.key) return true;
        return this.key == _key;
    }
}


exports.constructor = Service;