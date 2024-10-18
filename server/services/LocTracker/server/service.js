import { URL } from 'url';

import WebServer from '../../../webServer.js';
import { Subscriber, Service, ServiceFileManager, ServiceState } from '../../../serviceLib.js';

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

    curState = new ServiceState({
        curLat: 0,
        curLong: 0,
        locUpdateTime: new Date(),
    }, this);

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

    countryCacheManager = new ServiceFileManager({path: "countryCache.json", defaultValue: []}, this);

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
            'js/travelPanel.js',
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

        WebServer.registerEndPoint('/LocTracker/API/travelList.json', async (_request, _response) => {;
            let data = await this.getTravelList();
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

                    this.curState.curLat = data.lat;
                    this.curState.curLong = data.long;
                    this.curState.locUpdateTime = new Date();
                    this.pushCurState();
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
    

    async getCountryList() {
        let cache = await this.countryCacheManager.getContent();
        let countries = {};
        if (!cache || !cache.lastCacheUpdate)
        {
            countries = await this.#calcCountryListFromScratch();
        } else {
            countries = cache.countries;
            let dataPoints = await this.dataManager.getData();
            let newPoints = dataPoints.filter((point) => new Date(point.date) > cache.lastCacheUpdate);
            let tiles = this.#convertDataToTiles(newPoints);

            // Update the cache
            for (let tile of tiles)
            {
                let foundTile = false;
                for (let country in countries)
                {
                    for (let i = 0; i < countries[country].length; i++)
                    {
                        if (countries[country][i].lat !== tile.lat || countries[country][i].long !== tile.long) continue;
                        countries[country].counts += tile.counts;
                        foundTile = true;
                        break;
                    }
                }

                if (foundTile) continue;

                let countrySet = coordinateToCountry(tile.lat, tile.long);
                if (!countrySet.length) continue;
                let country = countrySet[0];

                if (!countries[country]) countries[country] = [];
                countries[country].push(tile);
            }
        }

        this.countryCacheManager.writeContent({
            countries: countries,
            lastCacheUpdate: new Date().getTime()
        });
        return countries;
    }



    async #calcCountryListFromScratch() {
        let dataPoints = await this.dataManager.getData();
        let tiles = this.#convertDataToTiles(dataPoints);

        let countries = {};
        for (let tile of tiles)
        {
            let countrySet = coordinateToCountry(tile.lat, tile.long);
            if (!countrySet.length) continue;
            let country = countrySet[0];

            if (!countries[country]) countries[country] = [];
            countries[country].push(tile);
        }

        return countries;
    }



    async getTravelList() {
        let dataPoints = await this.dataManager.getData();
        if (dataPoints.length < 2) return [];
        dataPoints.sort((a, b) => new Date(a.date).getTime() > new Date(b.date).getTime());
        let countries = await this.getCountryList();

        let sections = [];
        let prevPoint = dataPoints[0];
        let prevCountry = this.#getCountryFromPoint(prevPoint, countries);

        for (let i = 1; i < dataPoints.length; i++)
        {
            let curCountry = this.#getCountryFromPoint(dataPoints[i], countries);
            if (curCountry === prevCountry && i !== dataPoints.length - 1) continue;

            sections.push({
                country: prevCountry,
                start: prevPoint.date,
                end: dataPoints[i].date
            });
            prevPoint = dataPoints[i];
            prevCountry = curCountry;
        }
        return sections;
    }

    #getCountryFromPoint(_point, _countries) {
        let tileCoords = this.#getTileCoordFromPoint(_point);
        for (let country in _countries)
        {
            for (let tile of _countries[country])
            {
                if (tile.lat !== tileCoords.lat || tile.long !== tileCoords.long) continue;
                return country;
            }
        }
        return 'Unknown';
    }





    #convertDataToTiles(_data) {
        let tileList = [];
        
        for (let point of _data)
        {
            let coord = this.#getTileCoordFromPoint(point);
            let foundTile = tileList.find((tile) => tile.lat === coord.lat && tile.long === coord.long);

            if (!foundTile)
            {
                tileList.push(new Tile({long: coord.long, lat: coord.lat}));
            } else foundTile.counts++;
        }

        return tileList;
    }

    #getTileCoordFromPoint(_point) {
         return {lat: Math.floor(_point.lat / this.#tileWidth) * this.#tileWidth, long: Math.floor(_point.long / this.#tileHeight) * this.#tileHeight}
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











