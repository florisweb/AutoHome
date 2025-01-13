const COLORS = [
  [255, 0, 0],
  [0, 200, 0],
  [0, 0, 255],
  [200, 200, 0],
  [255, 0, 255],
  [0, 200, 200]
];

const DataManager = new class {
  #dataPoints = [];
  tileGrid = [];
  tileList = [];
  countryList = {};
  travelList = [];

  tileWidth = 0.009; // in latitudal degrees
  tileHeight = 0.015; // in longitudal degrees

  get data() {
    return this.#dataPoints;
  }

  get localisationFactor() {
    let points = this.#dataPoints.filter((_p) => new Date() - _p.date < 1000 * 60 * 60 * 24 * 7);
    let topPointCount = Math.ceil(points.length * .5);
    let tiles = this.#convertDataToTiles(points);
    tiles.list.sort((a, b) => a.counts < b.counts);
    let pointCount = 0;
    for (let i = 0; i < tiles.list.length; i++)
    {
      if (pointCount + tiles.list[i].counts > topPointCount) 
      {
        let fraction = (topPointCount - pointCount) / tiles.list[i].counts;
        return i + fraction;
      }
      pointCount += tiles.list[i].counts;
    }
    return tiles.list.length;
  }

  constructor() {
  }

  async setup() {
    await this.#fetchData();
    this.#fetchCountryList().then(() => onChange());
    this.#fetchTravelList().then(() => onChange());
    setInterval(() => this.#fetchData(), 1000 * 30);
  }


  async #fetchData() {
    let headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');

    let init = {
      method: 'GET',
      headers: headers,
    };

    let response = await fetch('LocTracker/API/data.json', init);
    let result = await response.json();
    if (typeof result === 'object') 
    {
      this.#dataPoints = [];
      for (let point of result)
      {
        if (!point.date || !point.lat || !point.long) continue;
        let dataPoint = new DataPoint(point);
        this.#dataPoints.push(dataPoint);
      }
    }

    
    let tiles = this.#convertDataToTiles(this.#dataPoints);
    this.tileGrid = tiles.grid;
    this.tileList = tiles.list;
    this.onFetchData();
  }

  async #fetchCountryList() {
    let headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');

    let init = {
      method: 'GET',
      headers: headers,
    };

    let response = await fetch('LocTracker/API/countryList.json', init);
    let result = await response.json();
    if (typeof result === 'object') 
    {
      this.countryList = result;
      for (let i = 0; i < Object.keys(this.countryList).length; i++)
      {
        this.countryList[Object.keys(this.countryList)[i]].color = COLORS[i];
      }
    }
    this.onFetchData();
  }

   async #fetchTravelList() {
    let headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');

    let init = {
      method: 'GET',
      headers: headers,
    };

    let response = await fetch('LocTracker/API/travelList.json', init);
    let result = await response.json();
    if (typeof result === 'object') this.travelList = result;
    this.travelList.sort((a, b) => a.start > b.start);
    this.onFetchData();
  }

  #convertDataToTiles(_data) {
    let tileList = [];
    let tileGrid = [];
    for (let point of _data)
    {
      let lat = Math.floor(point.lat / this.tileWidth) * this.tileWidth;
      let long = Math.floor(point.long / this.tileHeight) * this.tileHeight;
      if (!tileGrid[long]) tileGrid[long] = [];
      if (!tileGrid[long][lat])
      {
        let obj = new Tile({long: long, lat: lat});
        tileGrid[long][lat] = obj;
        tileList.push(obj);
      } else tileGrid[long][lat].counts++;
    }
    return {
      grid: tileGrid,
      list: tileList
    }
  }

  onFetchData() {
    TopBar.update();
    CountryPanel.update(this.countryList);
    TravelPanel.update(this.travelList);
  }
}


class Tile {
  long;
  lat;
  counts = 1;

  #country;

  get RGB() {
    if (!this.#country)
    {
      if (!Object.keys(DataManager.countryList).length) return [0, 0, 0];
      for (let country in DataManager.countryList)
      {
        for (let tile of DataManager.countryList[country])
        {
          if (tile.lat !== this.lat || tile.long !== this.long || tile.counts !== this.counts) continue;
          this.#country = country;
          break;
        }
        if (this.#country) break;
      }
    }
    return DataManager.countryList[this.#country]?.color || [0, 0, 0];
  }

  constructor({long, lat}) {
    this.long = long;
    this.lat = lat;
  }
}

class DataPoint {
  lat;
  long;
  date;

  constructor({lat, long, date}) {
    this.lat = lat;
    this.long = long;
    this.date = new Date(date);
  }
}

