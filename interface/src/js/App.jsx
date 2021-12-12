

const App = new function() {
	this.name = 'hey';
	this.render = function() {
		let test = 'hey';
		let element = <div className='test' ref={(e) => {test = e}}>{App.name}</div>;
		document.body.append(element);
		console.log(test);
	}
}


App.render();


function createElement(tagName, attrs = {}, ...children) {
  const elem = Object.assign(document.createElement(tagName), attrs);
  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child)
    else elem.append(child)
  }
	if (attrs.ref) attrs.ref(elem);
  return elem
}