


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
  drawCurLocation();
}	


function drawTiles() {
  for (let tile of DataManager.tileList) 
  {
    if (!myMap.map.getBounds().contains({lat: tile.lat, lng: tile.long})) continue;
    let pos = myMap.latLngToPixel(tile.lat, tile.long);
    let pos2 = myMap.latLngToPixel(tile.lat + DataManager.tileWidth, tile.long + DataManager.tileHeight);
    let dx = pos2.x - pos.x;
    let dy = pos2.y - pos.y;

    let opacity = (1 - Math.pow(2, -tile.counts / 10)) / 2;
    fill('rgba(255, 0, 0, ' + opacity + ')');
    stroke('#f00');
    rect(pos.x, pos.y, dx, dy);
  }
}

function drawPoints() {
  let dataPoints = Object.assign([], DataManager.data);
  dataPoints = dataPoints.splice(Math.max(dataPoints.length - drawXMostRecentPointsCount, 0), drawXMostRecentPointsCount);
  for (let point of dataPoints) 
  {
    if (!myMap.map.getBounds().contains({lat: point.lat, lng: point.long})) continue;
    let pos = myMap.latLngToPixel(point.lat, point.long);
    fill('#f00');
    stroke('#f00');
    ellipse(pos.x, pos.y, 5, 5);
  }
}

function drawCurLocation() {
  if (!curLocation) return;
  if (!myMap.map.getBounds().contains({lat: curLocation.latitude, lng: curLocation.longitude})) return;
  let pos = myMap.latLngToPixel(curLocation.latitude, curLocation.longitude);

  drawPointToCanvas(pos.x, pos.y, 10, "#f00")

  function drawPointToCanvas(x, z, radius, colour) {
    let r = 10;

    if (radius) drawRadius(x, z, radius, colour);
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




function calcMetresPerPixel() {
    const southEastPoint = myMap.map.getBounds().getSouthEast();
    const northEastPoint = myMap.map.getBounds().getNorthEast();
    const mapHeightInMetres = southEastPoint.distanceTo(northEastPoint);
    const mapHeightInPixels = myMap.map.getSize().y;

    return mapHeightInMetres / mapHeightInPixels;
}
