var Socket;

function init() {
  Socket = new WebSocket('ws://localhost:8080/');

  Socket.onmessage = function (event) {
    console.log(event.data);
  };
}

document.getElementById('BTN_1').addEventListener('click', button_1_pressed);

function button_1_pressed() {
  Socket.send(JSON.stringify({
    type: 1,
    data: true
  }));
}

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