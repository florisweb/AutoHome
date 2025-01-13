


const drawXMostRecentPointsCount = 100;

// Options for map
var options = {
  lat: 52.3,
  lng: 5,
  zoom: 8,
  style: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
}

// Create an instance of Leaflet
var mappa = new Mappa('Leaflet');
var myMap;

var canvas;
let ctx;

let curLocation;

async function setup() {
  await DataManager.setup();
  canvas = createCanvas(document.body.offsetWidth, document.body.offsetHeight);
  ctx = canvas.drawingContext;
  ctx.circle = function(_x, _z, _radius) {
    ctx.beginPath();
    ctx.arc(_x, _z, _radius, 0, 2 * Math.PI);
  }

  curLocation = await getLocation().catch(alert);
  if (curLocation)
  {
    options.lat = curLocation.latitude;
    options.lng = curLocation.longitude;
    options.zoom = 12;
  }

  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);
  myMap.onChange(onChange);

  fill('rgba(255, 0, 0, .1)');
  stroke(255, 0, 0);
}



function onChange() {
  clear();
  drawTiles();
  drawPoints();
  drawCountries();
}	


function drawTiles() {
  for (let tile of DataManager.tileList) 
  {
    if (
      !myMap.map.getBounds().contains({lat: tile.lat, lng: tile.long}) &&
      !myMap.map.getBounds().contains({lat: tile.lat + DataManager.tileWidth, lng: tile.long + DataManager.tileHeight})
    ) continue;

    let pos = myMap.latLngToPixel(tile.lat, tile.long);
    let pos2 = myMap.latLngToPixel(tile.lat + DataManager.tileWidth, tile.long + DataManager.tileHeight);
    let dx = pos2.x - pos.x;
    let dy = pos2.y - pos.y;

    let opacity = (1 - Math.pow(2, -tile.counts / 10)) * .6 + .2;
    fill(`rgba(${tile.RGB[0]}, ${tile.RGB[1]}, ${tile.RGB[2]}, ${opacity})`);
    ctx.fillRect(pos.x, pos.y, dx, dy);
    ctx.stroke();
    ctx.fill();

    // ctx.fillStyle = `rgba{${tile.RGB[0]}, ${tile.RGB[1]}, ${tile.RGB[2]}, ${opacity})`;
    // ctx.strokeStyle = `rgb{${tile.RGB[0]}, ${tile.RGB[1]}, ${tile.RGB[2]})`;
    // ctx.rect(pos.x, pos.y, dx, dy);
    // ctx.stroke();
    // ctx.fill();
  }
}

function drawPoints() {
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

  drawCurLocation(lastDataPoint, new Date().getTime() - lastDataPoint.date < updateInterval ? '#00f' : '#668');
  let pos = myMap.latLngToPixel(lastDataPoint.lat, lastDataPoint.long);
  ctx.strokeStyle = '#55d';
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);

  for (let i = 1; i < pointsInConnection.length; i++) 
  {
    let pos = myMap.latLngToPixel(pointsInConnection[i].lat, pointsInConnection[i].long);
    ctx.lineTo(pos.x, pos.y);
  }
  ctx.closePath();
  ctx.stroke();
}


function drawCurLocation(_curLoc, _color) {
  if (!_curLoc) return;
  if (!myMap.map.getBounds().contains({lat: _curLoc.lat, lng: _curLoc.long})) return;
  let pos = myMap.latLngToPixel(_curLoc.lat, _curLoc.long);

  drawPointToCanvas(pos.x, pos.y, 30, _color)

  function drawPointToCanvas(x, z, radius, colour) {
    let r = 10;

    if (radius) drawRadius(x, z, radius / 2, colour);
    drawNeedle(x, z, r);

    let gradient = ctx.createLinearGradient(x - r, z - r, x + r, z + r);
    gradient.addColorStop(0, colour);
    gradient.addColorStop(1, "#030303");
    
    ctx.fillStyle = gradient;
    ctx.circle(x, z - 2 * r, r);
    ctx.fill();
  }

  function drawNeedle(x, z, r) {
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

  function drawRadius(_x, _z, _radius, _colour) {
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



let countryCtx = countryOverviewCanvas.getContext('2d');
function drawCountries() {
  countryCtx.clearRect(0, 0, countryOverviewCanvas.width, countryOverviewCanvas.height);
  for (let country in CountryData.paths)
  {
    let visited = !!DataManager.travelList.find((travel) => travel.country === CountryData.map2To3Name(country) || travel.country === country)
    drawCountrySVG(country, visited);
  }
  drawCountrySVG('NL');
}

function drawCountrySVG(_country, _visited = false) {
  let path = CountryData.paths[_country];
  if (!path || !path.d) return;

  let pos = myMap.latLngToPixel(0, 0);

  const transPath = new Path2D();
  var ctxPath = new Path2D(path.d);
  const scaleFactor = 0.4 * countryOverviewCanvas.height / 400;
  transPath.addPath(ctxPath, {
    e: -130,
    f: 0,
    a: scaleFactor,
    b: 0, // rotation
    c: 0, // rotation
    d: scaleFactor,
  }); 

  countryCtx.stroke(transPath);
  countryCtx.fillStyle = 'rgba(255, 0, 0, .5)';
  if (_visited) countryCtx.fill(transPath);
}


function calcMetresPerPixel() {
    const southEastPoint = myMap.map.getBounds().getSouthEast();
    const northEastPoint = myMap.map.getBounds().getNorthEast();
    const mapHeightInMetres = southEastPoint.distanceTo(northEastPoint);
    const mapHeightInPixels = myMap.map.getSize().y;

    return mapHeightInMetres / mapHeightInPixels;
}
