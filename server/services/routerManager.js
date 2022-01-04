
import fetch from 'node-fetch';
import fritz from 'fritzapi';
import { Subscriber, Service } from './serviceLib.js';

// const maxDataAge = 1000 * 60 * 2;


function CustomSubscriber() {
    Subscriber.call(this, ...arguments);
    this.handleRequest = function(_message) {}
}

export default new function() {
    const This = this;
    Service.call(this, {
        id: 'RouterManager',
        SubscriberTemplate: CustomSubscriber
    });
    this.devices = this.config.devices;

    let sid = false;
    this.setup = async function() {
        sid = await fritz.getSessionID(this.config.credentials.username, this.config.credentials.password); 
        console.log('[RouterManager] setup(): SID retrieved:', sid);    
        syncLoop();
    }

    async function syncLoop() {
        await This.update();
        setTimeout(syncLoop, This.config.updateTimeout);
    }


    async function fetchNetworkData() {
        let response = await fetch('http://fritz.box/net/network.lua?sid=' + sid + '&updatecheck=&no_check=&no_sidrenew=&updating=&timeout=&useajax=1&xhr=1&t1625490333641=nocache');
        let result = await response.text();
        let data = [];
        try {
            data = JSON.parse(result);
        } catch (e) {
            console.log('[RouterManager] Error while parsing text from fetchNetworkData:', e);

            console.log('Getting new sid...');
            await People.setup();
            return new Promise(async function (resolve, error) {
              await wait(1000);
              resolve(await fetchNetworkData());
            });
        }
        return data.topology.devices;
    }
    
    this.update = async function() {
        let data = await fetchNetworkData();
        for (let device of this.devices)
        {
            let wasOnline = device.online;
            device.online = false;
            for (let uid of device.UID) 
            {
              if (!Object.keys(data).includes(uid)) continue;
              device.online = true;
              device.name = data[uid].nameinfo.name;
              break;
            }
            if (wasOnline == device.online) continue;
            console.log("[RouterManager] Device " + (device.online ? "connected" : "disconnected"), device.name, device.type);
            this.pushEvent({
                type: device.online ? "deviceConnected" : "deviceDisconnected",
                data: device,
            });
        }
    }
   
}




function wait(_t) {
  return new Promise(function (resolve) {
    setTimeout(resolve, _t);
  });
}





