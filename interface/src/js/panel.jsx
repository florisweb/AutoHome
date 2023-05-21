import { DownTimeGraph, Graph } from './components.jsx';


export class Panel {
	html = {};
	#size = [1, 1];
	constructor({size} = {size: [1, 1]}) {
		this.#size = size;
	}	
	
	render() {
		this.html.self = <div className={'Panel animateIn'}>
			{this.renderContent()}
		</div>;
		this.html.self.style.width = 'calc(var(--componentWidth) * ' + this.#size[0] + ' - 10px * 2)'; 
		this.html.self.style.height = 'calc(var(--componentHeight) * ' + this.#size[1] + ' - 10px * 2)'; 
		return this.html.self;
	}
	
	renderContent() {}
}






export class HomePagePanel extends Panel {
	service; 
	#isOnline = false;
	constructor(_args, _service) {
		super(...arguments);
		this.service = _service;
	}

	render() {
		let html = super.render();
		html.addEventListener('click', () => {
			if (!this.service.page) return;
			MainContent.servicePage.open(this.service);
		});
		return html;
	}


	renderOnlineIndicator() {
		this.html.onlineIndicator = <div className='onlineIndicator'></div>;
		this.setOnlineState(this.#isOnline);
		return this.html.onlineIndicator;
	}
	setOnlineState(_isOnline) {
		this.#isOnline = _isOnline;
		if (!this.html.onlineIndicator) return;

		this.html.onlineIndicator.classList.remove("online");
		if (!this.#isOnline) return;
		this.html.onlineIndicator.classList.add("online");
	}
}




export class GraphPanel extends Panel {
	#graph;
	#title;
	#customClass;
	constructor({panelTitle, customClass, xLabel, yLabel}) {
		super(arguments[0]);
		this.#customClass = customClass;
		this.#title = panelTitle;
		this.#graph = new Graph(...arguments);
	}
	

	render() {
		let html = super.render();
		html.className += ' ' + (this.#customClass ? this.#customClass : '') + " graphPanel";
		return html;
	}

	setData(_lines) {
		this.#graph.setData(_lines);
	}

	renderContent() {
		return [
			<div className='text panelTitle small'>{this.#title}</div>,
			this.#graph.render()
		];
	}
}





export class DownTimePanel extends Panel {
	#downTimeGraph = new DownTimeGraph();
	#customClass;
	constructor(_params = {customClass: ''}) {
		super(_params);
		this.#customClass;
	}

	render() {
		let html = super.render();
		html.className += ' ' + (this.#customClass ? this.#customClass : '') + " graphPanel downTimePanel";
		return html;
	}

	setData() {
		return this.#downTimeGraph.setData(...arguments);
	}
	
	renderContent() {
		return [
			<div className='text panelTitle small'>Downtime</div>,
			this.#downTimeGraph.render()
		];
	}
}