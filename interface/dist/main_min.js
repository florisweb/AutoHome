var Socket;

function init() {
  let domain = window.location.origin;
  if (domain != 'localhost') domain = domain.split('://')[1];
  Socket = new WebSocket('ws://' + domain + ':8080/');

  Socket.onmessage = function (event) {
    let message = JSON.parse(event.data);
    console.log(message);
    if (message.type != 'status' && message.type != 'lampStatus') return;

    switch (message.serviceId) {
      case "CableLamp":
        lampStatus.innerHTML = message.data ? 'lamp on' : 'lamp off';
        break;

      case "MovementTracker":
        atHomeStatus.innerHTML = message.isAtHome ? 'is home' : 'is not home';
        inRoomStatus.innerHTML = message.isInRoom ? 'is in room' : 'is not in room';
        break;
    }
  };

  Socket.onopen = function () {
    Socket.send(JSON.stringify({
      id: "InterfaceClient"
    }));
  };
}

document.getElementById('BTN_1').addEventListener('click', () => {
  Socket.send(JSON.stringify({
    serviceId: "CableLamp",
    type: "setLampStatus",
    data: true
  }));
});
document.getElementById('BTN_2').addEventListener('click', () => {
  Socket.send(JSON.stringify({
    serviceId: "CableLamp",
    type: "setLampStatus",
    data: false
  }));
});
document.getElementById('BTN_3').addEventListener('click', () => {
  Socket.send(JSON.stringify({
    serviceId: "CableLamp",
    type: "runLightProgram"
  }));
});
init();
const App = new function () {
  this.name = 'hey';

  this.render = function () {
    let test = 'hey';
    let element = createElement("div", {
      className: "test",
      ref: e => {
        test = e;
      }
    }, App.name);
    document.body.append(element);
    console.log(test);
  };
}();
App.render();

function createElement(tagName, attrs = {}, ...children) {
  const elem = Object.assign(document.createElement(tagName), attrs);

  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child);else elem.append(child);
  }

  if (attrs.ref) attrs.ref(elem);
  return elem;
}