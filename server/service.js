


function Service({id, key}) {
    this.subscribers = [];
    this.id = id;
    this.key = key;
    this.authenticate = (_key) => {
        if (!this.key) return true;
        return this.key == _key;
    }
}


exports.constructor = Service;