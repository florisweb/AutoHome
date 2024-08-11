import { URL } from 'url';

import WebServer from '../../../webServer.js';
import { Subscriber, Service, ServiceFileManager } from '../../../serviceLib.js';

import coordinateToCountry from 'coordinate_to_country';



function CustomSubscriber(_config) {
    const This = this;
    Subscriber.call(this, {..._config, handleRequest: handleRequest});

    async function handleRequest(_message) {
        if (!_message.isRequestMessage) return;
        switch (_message.type)
        {
            case "getLocalisationFactor": 
                return _message.respond({
                    type: 'localisationFactor',
                    data: await This.service.getLocalisationFactor()
                });
            case "getNewTilesInLast4Weeks": 
                return _message.respond({
                    type: 'getNewTilesInLast4Weeks',
                    data: await This.service.getNewTilesInLast4Weeks()
                });
        }
    }
}


export default class extends Service {
    #tileWidth = .009;
    #tileHeight = 0.015;


    dataManager = new (function(_service) {
        let fm = new ServiceFileManager({path: "data.json", defaultValue: []}, _service);
        this.addDataPoint = async function({lat, long}) {
            let data = await fm.getContent();
            data.push({date: Date.now(), lat: lat, long: long});
            return fm.writeContent(data);
        }
        this.getData = function() {
            return fm.getContent();
        }
    })(this);

    constructor({id, config}) {
        super(arguments[0], CustomSubscriber);

        const root = './services/LocTracker/interface/App/';
        const files = [
            'index.html',
            'js/dataManager.js',
            'js/extraFunctions.js',
            'js/mappa.js',
            'js/p5.min.js',
            'js/script.js',
            'js/topBar.js',
            'js/countryPanel.js',
            'css/main.css'
        ];

        WebServer.registerStaticEndPoint('/LocTracker', './services/LocTracker/interface/App/index.html');    
        for (let file of files)
        {
            WebServer.registerStaticEndPoint('/LocTracker/' + file, root + file);
        };

        WebServer.registerEndPoint('/LocTracker/API/data.json', async (_request, _response) => {;
            let data = await this.dataManager.getData();
            _response.send(data);
        });
        WebServer.registerEndPoint('/LocTracker/API/countryList.json', async (_request, _response) => {;
            let data = await this.getCountryList();
            _response.send(data);
        });
    }

    onMessage(_message) {
        this.pushEvent(_message);
    }


    onLoadRequiredServices({ShortCutAPI}) {
        if (!ShortCutAPI) return console.error(`${this.serviceId}: Error while loading, ShortCutAPI not found`);
        ShortCutAPI.subscribe({
            acceptorService: this,
            onEvent: (_data) => {
                try {
                    let data = {
                        lat: parseFloat(_data.lat),
                        long: parseFloat(_data.long),
                    }
                    if (isNaN(data.lat) || isNaN(data.long)) return _response.sendStatus(400);
                    this.dataManager.addDataPoint(data);
                } catch (e) {
            }
        }})
    }


    async getLocalisationFactor() {
        let dataPoints = await this.dataManager.getData();
        let points = dataPoints.filter((_p) => new Date() - new Date(_p.date) < 1000 * 60 * 60 * 24 * 7);
        let topPointCount = Math.ceil(points.length * .5);
        
        let tiles = this.#convertDataToTiles(points);
        tiles.sort((a, b) => a.counts < b.counts);
        
        let pointCount = 0;
        for (let i = 0; i < tiles.length; i++)
        {
          if (pointCount + tiles[i].counts > topPointCount) 
          {
            let fraction = (topPointCount - pointCount) / tiles[i].counts;
            return i + fraction;
          }
          pointCount += tiles[i].counts;
        }
        return tiles.length;
    }

    async getNewTilesInLast4Weeks() {
        let dataPoints = await this.dataManager.getData();
        let totalTileCount = this.#convertDataToTiles(dataPoints).length
        
        let points = dataPoints.filter((_p) => (new Date() - new Date(_p.date)) / 1000 / 60 / 60 / 24 > 7 * 4);
        return totalTileCount - this.#convertDataToTiles(points).length;
    }
    

    // async getCountryList() {
    //     let dataPoints = await this.dataManager.getData();
    //     return this.#binDataByCountry(dataPoints);
    // }
    async getCountryList() {
        let dataPoints = await this.dataManager.getData();
        let tiles = this.#convertDataToTiles(dataPoints);

        let countries = {};
        for (let tile of tiles)
        {
            let countrySet = coordinateToCountry(tile.lat, tile.long);
            if (!countrySet.length) {
                console.log('not found', countrySet);
                continue;
            }
            let country = countrySet[0];

            if (!countries[country]) countries[country] = [];
            countries[country].push(tile);
        }
        return countries;
    }




    #convertDataToTiles(_data) {
        let tileList = [];
        
        for (let point of _data)
        {
            let lat = Math.floor(point.lat / this.#tileWidth) * this.#tileWidth;
            let long = Math.floor(point.long / this.#tileHeight) * this.#tileHeight;
            let foundTile = tileList.find((tile) => tile.lat === lat && tile.long === long);

            if (!foundTile)
            {
                tileList.push(new Tile({long: long, lat: lat}));
            } else foundTile.counts++;
        }

        return tileList;
    }

    #tileListToGrid(_list) {
        let tileGrid = [];
        for (let tile of _list) 
        {
            let lat = Math.floor(point.lat / this.#tileWidth) * this.#tileWidth;
            let long = Math.floor(point.long / this.#tileHeight) * this.#tileHeight;
            if (!tileGrid[long]) tileGrid[long] = [];
            if (tileGrid[long][lat]) {
                console.log('error tile already found')
                continue;
            }
            tileGrid[long][lat] = tile;
        }

        return tileGrid;
    }



    // #binDataByCountry(_data) {
    //     let countries = {};
    //     for (let point of _data)
    //     {
    //         let countrySet = coordinateToCountry(point.lat, point.long);
    //         if (!countrySet.length) {
    //             console.log('not found', countrySet);
    //             continue;
    //         }
    //         let country = countrySet[0];

    //         if (!countries[country]) countries[country] = [];
    //         countries[country].push(point);
    //     }
    //     return countries;
    
    // }
}



class Tile {
  long;
  lat;
  counts = 1;
  constructor({long, lat}) {
    this.long = long;
    this.lat = lat;
  }
}











