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

	setVisibility(_visible) {
		if (!this.html.self) return;
		this.html.self.classList.toggle('hide', !_visible);
	}
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
		this.setVisibility(this.service.enabled);
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
		this.html.onlineIndicator.classList.toggle("online", this.#isOnline);
	}
}

export class SystemServicePagePanel extends Panel {
	isSystemPagePanel = true;
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
}


export class SystemPagePanel extends Panel {
	service; 
	condition = {};
	constructor(_args, _service, _condition) {
		super({size: [1, 1], ..._args}, _service);
		this.service = _service;
		this.condition = _condition
	}

	render() {
		let html = super.render();
		html.className += ' hasIcon systemPagePanel';
		if (this.condition.error) html.classList.add('error');
		html.addEventListener('click', (_e) => {
			if (_e.target.classList.contains('button') || !this.condition.enabled || !this.condition.isDeviceService) return;
			MainContent.serviceConfigPage.open(this.service)
		});
		return html;
	}

	renderContent() {
       	this.html.subText = <div className='text subText'>{this.condition.state + (this.condition.error ? ' - ' + this.condition.error : '')}</div>;
		this.html.icon = <img className='panelIcon' src={this.service.iconSrc}></img>;
		this.html.enableButton = <div className='button bDefault bBoxy filled' onclick={() => {
			MainContent.systemPage.setServiceEnableState(this.service.id, !this.condition.enabled)
		}}>{this.condition.enabled ? 'Disable' : 'Enable'}</div>
		return [
			this.html.icon,
			<div className='text panelTitle'>{this.service.name}</div>,
			this.html.subText,
			this.html.enableButton
		];
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
	updateLegend() {
		return this.#graph.updateLegend(...arguments)
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