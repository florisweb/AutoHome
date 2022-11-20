import MainContent from './mainContent.jsx';
import Server from './server/server.js';

const App = new function() {
	this.setup = function() {
		console.log('App.setup');
		MainContent.setup();
		Server.setup();
	}
}


window.Server = Server;
window.App = App;

window.createElement = function(tagName, attrs = {}, ...children) {
  const elem = Object.assign(document.createElement(tagName), attrs);
  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child)
    else elem.append(child)
  }
	if (attrs && attrs.ref) attrs.ref(elem);
  return elem
}


App.setup();
export default App;