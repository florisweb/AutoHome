
let MainContent;
const App = new function() {
	this.setup = function() {
		MainContent = new _MainContent();
		MainContent.setup();
		Server.setup();
	}
}
App.setup();


function createElement(tagName, attrs = {}, ...children) {
  const elem = Object.assign(document.createElement(tagName), attrs);
  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child)
    else elem.append(child)
  }
	if (attrs && attrs.ref) attrs.ref(elem);
  return elem
}