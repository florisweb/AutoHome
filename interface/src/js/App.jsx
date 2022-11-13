// import { panel } from './_services/CableLamp/interface.js';
import MainContent from './mainContent.jsx';


const App = new function() {
	this.setup = function() {
		MainContent.setup();
		// Server.setup();
	}
}


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