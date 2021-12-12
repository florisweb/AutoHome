let Service = require('./service.js').constructor;
console.log(Service);

function CableLamp() {
    Service.call(this, {
        id: 'CableLamp',
        key: ''
    });
}

exports.constructor = CableLamp;