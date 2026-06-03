const mappa = new Mappa('Leaflet');

const MapManager = new class {
  config = {

    // Options for map
    mapOptions: {
      lat: 52.3,
      lng: 5,
      zoom: 8,
      style: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
    }
  }

  map;
  canvas;
  ctx;
  #countryOverviewCanvas;
  #countryCtx;

  #curLocation;

  constructor() {
    this.#countryOverviewCanvas = document.querySelector('#countryOverviewCanvas');
    this.#countryCtx = this.#countryOverviewCanvas.getContext('2d');
  }

  async setup() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = document.body.offsetWidth;
    this.canvas.height = document.body.offsetHeight;
    // createCanvas(document.body.offsetWidth, document.body.offsetHeight);
    // this.ctx = this.canvas.drawingContext;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.circle = function(_x, _z, _radius) {
      this.beginPath();
      this.arc(_x, _z, _radius, 0, 2 * Math.PI);
    }

   
    this.#curLocation = await getLocation().catch(alert);
    if (this.#curLocation)
    {
      this.config.mapOptions.lat = this.#curLocation.latitude;
      this.config.mapOptions.lng = this.#curLocation.longitude;
      this.config.mapOptions.zoom = 12;
    }

    this.map = mappa.tileMap(this.config.mapOptions);
    this.map.overlay(this.canvas);
    this.map.onChange(() => this.onChange());

    this.ctx.fillStyle = 'rgba(255, 0, 0, .1)';
    this.ctx.strokeStyle = 'rgb(255, 0, 0)';
    this.ctx.fill();
    this.ctx.stroke();

    await DataManager.setup();
  }



  onChange() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.#drawTiles();
    this.#drawPoints();
    this.#drawCountries();
  }

  #jumpedToFirstPoint = false;
  onDataLoad() {
    let dataPoint = DataManager.data[DataManager.data.length - 1];
    if (!dataPoint || this.#jumpedToFirstPoint) return;
    this.map.map.setView({lat: dataPoint.lat, lng: dataPoint.long}, 10);
    this.#jumpedToFirstPoint = true;
  }




  #drawTiles() {
    for (let tile of DataManager.tileList) 
    {
      if (
        !this.map.map.getBounds().contains({lat: tile.lat, lng: tile.long}) &&
        !this.map.map.getBounds().contains({lat: tile.lat + DataManager.tileWidth, lng: tile.long + DataManager.tileHeight})
      ) continue;

      let pos = this.map.latLngToPixel(tile.lat, tile.long);
      let pos2 = this.map.latLngToPixel(tile.lat + DataManager.tileWidth, tile.long + DataManager.tileHeight);
      let dx = pos2.x - pos.x;
      let dy = pos2.y - pos.y;

      let opacity = (1 - Math.pow(2, -tile.counts / 10)) * .6 + .2;
      this.ctx.fillStyle = `rgba(${tile.RGB[0]}, ${tile.RGB[1]}, ${tile.RGB[2]}, ${opacity})`;
       // fill(`rgba(${tile.RGB[0]}, ${tile.RGB[1]}, ${tile.RGB[2]}, ${opacity})`);
      this.ctx.fillRect(pos.x, pos.y, dx, dy);
      this.ctx.stroke();
      this.ctx.fill();

      // ctx.fillStyle = `rgba{${tile.RGB[0]}, ${tile.RGB[1]}, ${tile.RGB[2]}, ${opacity})`;
      // ctx.strokeStyle = `rgb{${tile.RGB[0]}, ${tile.RGB[1]}, ${tile.RGB[2]})`;
      // ctx.rect(pos.x, pos.y, dx, dy);
      // ctx.stroke();
      // ctx.fill();
    }
  }

  #drawPoints() {
    const updateInterval = 30 * 60 * 1000;
    let lastDataPoint = DataManager.data[DataManager.data.length - 1];
    if (!lastDataPoint) return;

    let pointsInConnection = [];
    let prevPoint = lastDataPoint;
    for (let i = DataManager.data.length - 2; i >= 0; i--)
    {
      if (DataManager.data[i].date < new Date().getTime() - 24 * 60 * 60 * 1000) break;
      let dt = Math.abs(DataManager.data[i].date - prevPoint.date);
      if (dt > updateInterval * 2) break;
      prevPoint = DataManager.data[i];
      pointsInConnection.push(prevPoint);
    }

    this.#drawCurLocation(lastDataPoint, new Date().getTime() - lastDataPoint.date < updateInterval ? '#00f' : '#668');
    let pos = this.map.latLngToPixel(lastDataPoint.lat, lastDataPoint.long);
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    this.ctx.setLineDash([10, 10]);

    let prevPos = pos;
    for (let i = 1; i < pointsInConnection.length; i++) 
    {
      let pos = this.map.latLngToPixel(pointsInConnection[i].lat, pointsInConnection[i].long);
      this.ctx.strokeStyle = '#55d';
      this.ctx.beginPath();
      this.ctx.moveTo(prevPos.x, prevPos.y);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.closePath();
      this.ctx.stroke();
      prevPos = pos;
    }
    
    this.ctx.fill();
    this.ctx.setLineDash([]);
  }


  #drawCurLocation(_curLoc, _color) {
    if (!_curLoc) return;
    if (!this.map.map.getBounds().contains({lat: _curLoc.lat, lng: _curLoc.long})) return;
    let pos = this.map.latLngToPixel(_curLoc.lat, _curLoc.long);

    drawPointToCanvas(pos.x, pos.y, 30, _color, this.ctx)

    function drawPointToCanvas(x, z, radius, colour, ctx) {
      let r = 10;

      if (radius) drawRadius(x, z, radius / 2, colour, ctx);
      drawNeedle(x, z, r, ctx);

      let gradient = ctx.createLinearGradient(x - r, z - r, x + r, z + r);
      gradient.addColorStop(0, colour);
      gradient.addColorStop(1, "#030303");
      
      ctx.fillStyle = gradient;
      ctx.circle(x, z - 2 * r, r);
      ctx.fill();
    }

    function drawNeedle(x, z, r, ctx) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(x, z);
      ctx.lineTo(x - r, z - 2 * r - 1);
      ctx.lineTo(x, z - 2 * r - 1);
      ctx.fill();

      let grd = ctx.createLinearGradient(x, z - 2 * r - 1, x + 0.5 * r, z);
      grd.addColorStop(0, "#fff")
      grd.addColorStop(1, "#aaa");
      ctx.fillStyle = grd;
      
      ctx.beginPath();
      ctx.moveTo(x, z);
      ctx.lineTo(x + r, z - 2 * r - 1);
      ctx.lineTo(x, z - 2 * r - 1);
      ctx.fill();
    }

    function drawRadius(_x, _z, _radius, _colour, ctx) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = _colour;
      ctx.fillStyle = _colour;
      ctx.globalAlpha = 0.2;

      ctx.circle(_x, _z, _radius);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
    }
  }



  #drawCountries() {
    this.#countryCtx.clearRect(0, 0, this.#countryOverviewCanvas.width, this.#countryOverviewCanvas.height);
    for (let country in CountryData.paths)
    {
      let visited = !!DataManager.travelList.find((travel) => travel.country === CountryData.map2To3Name(country) || travel.country === country)
      this.#drawCountrySVG(country, visited);
    }
    this.#drawCountrySVG('NL');
  }

  #drawCountrySVG(_country, _visited = false) {
    let path = CountryData.paths[_country];
    if (!path || !path.d) return;

    let pos = this.map.latLngToPixel(0, 0);

    const transPath = new Path2D();
    var ctxPath = new Path2D(path.d);
    const scaleFactor = 0.4 * this.#countryOverviewCanvas.height / 400;
    transPath.addPath(ctxPath, {
      e: -130,
      f: 0,
      a: scaleFactor,
      b: 0, // rotation
      c: 0, // rotation
      d: scaleFactor,
    }); 

    this.#countryCtx.stroke(transPath);

    if (_visited)
    {
      const countryIndex = Object.keys(DataManager.countryList).findIndex((name) => name === CountryData.map2To3Name(_country));
      if (countryIndex >= 0)
      {
        this.#countryCtx.fillStyle = `rgba(${COLORS[countryIndex][0]}, ${COLORS[countryIndex][1]}, ${COLORS[countryIndex][2]}, 0.5)`;
      } else {
        this.#countryCtx.fillStyle = 'rgba(255, 0, 0, .5)';
      }
      this.#countryCtx.fill(transPath);
    } 
  }


  #calcMetresPerPixel() {
      const southEastPoint = this.map.map.getBounds().getSouthEast();
      const northEastPoint = this.map.map.getBounds().getNorthEast();
      const mapHeightInMetres = southEastPoint.distanceTo(northEastPoint);
      const mapHeightInPixels = this.map.map.getSize().y;

      return mapHeightInMetres / mapHeightInPixels;
  }
}


MapManager.setup();