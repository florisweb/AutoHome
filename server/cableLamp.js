let Service = require('./service.js').constructor;

function CableLamp() {
    Service.call(this, {
        id: 'CableLamp',
    });
}

exports.constructor = CableLamp;