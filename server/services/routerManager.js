
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
    this.list = this.config.peopleData;

    let sid = false;
    this.setup = async function() {
        sid = await fritz.getSessionID(this.config.credentials.username, this.config.credentials.password); 
        console.log('[!] Server.people.setup(): SID retrieved:', sid);
        await this.updatePeople();
        console.log('mensjes', this.list);
    }
    this.setup();

    async function fetchNetworkData() {
        let response = await fetch('http://fritz.box/net/network.lua?sid=' + sid + '&updatecheck=&no_check=&no_sidrenew=&updating=&timeout=&useajax=1&xhr=1&t1625490333641=nocache');
        let result = await response.text();
        let data = [];
        try {
            data = JSON.parse(result);
        } catch (e) {
            Logger.log('[!] Error while parsing text from fetchNetworkData:', e);

            Logger.log('Getting new sid...');
            await People.setup();
            return new Promise(async function (resolve, error) {
              await wait(1000);
              resolve(await fetchNetworkData());
            });
        }
        return data.topology.devices;
    }
    
    this.updatePeople = async function() {
        console.log('[!] Send API Request');
        let data = await fetchNetworkData();
        console.log('peopledata', data);
        for (let person of this.list)
        {
          person.atHome = false;
          for (let device of person.devices)
          {
            let uids = [];
            if (typeof device.UID == 'object')
            {
              uids = device.UID;
            } else uids = [device.UID];
            device.online = false;
            
            for (let uid of uids) 
            {
              if (!Object.keys(data).includes(uid)) continue;
              device.online = true;
              break;
            }
            if (device.online) person.atHome = true;
          }
        }
        console.log('- Recieved API response');
    }
   
}







function wait(_t) {
  return new Promise(function (resolve) {
    setTimeout(resolve, _t);
  });
}





