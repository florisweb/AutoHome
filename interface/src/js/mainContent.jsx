import { appendContent } from './extraFunctions.js';
import GestureManager from './gestureManager.js';
import { Panel, DownTimePanel, SystemPagePanel } from './panel.jsx';
import { Button } from './components.jsx';
import ServiceManager from './service.jsx';
import { Page, PageHeader } from './page.jsx' ;

import { RequestMessage } from './server/message.js';


const MainContent = new class {
	#HTML = {
		mainContent: mainContent
	}
	curPage;
	#pages = [];
	setup() {
		this.homePage 			= new MainContent_homePage();
		this.servicePage 		= new MainContent_servicePage();
		this.serviceConfigPage 	= new MainContent_serviceConfigPage();
		this.systemPage 		= new MainContent_systemPage();
		this.#pages = [this.homePage, this.servicePage, this.serviceConfigPage, this.systemPage];

		this.render();
		this.homePage.open();
	}
	
	render() {
		for (let page of this.#pages) this.#HTML.mainContent.append(page.render());

		let lastSwipe = new Date();
		GestureManager.onSwipeRight(this.#HTML.mainContent, function(_dx, _dy, _start) {
			if (_start[0] > 150 || Math.abs(_dx) < 50) return;
			if (new Date() - lastSwipe < 400) return;
			lastSwipe = new Date();
			if (This.servicePage.openState) return This.homePage.open();
			if (This.serviceConfigPage.openState) return This.servicePage.open(This.serviceConfigPage.curService);
		});
	}
}
export default MainContent;



class MainContent_homePage extends Page {
	header;
	constructor() {
		super({renderContentOnOpen: true});
		this.header = new PageHeader({
			pageIconInBox: false,
			leftButtonSrc: false,
			pageIconSrc: 'images/logoInverted.png', 
			rightButtonSrc: 'images/settingsIcon.png',
		});
		this.header.html.rightButton.addEventListener('click', () => MainContent.systemPage.open());
		this.header.title = 'ThuisWolk';
	}

	renderContent() {
		let servicePanels = [];
		for (let service of ServiceManager.services)
		{
			if (!service.panel || service.panel.isSystemPagePanel) continue;
			servicePanels.push(service.panel.render());
		}

		return [
			this.header.render(),
			<div className='PanelBox'>{servicePanels}</div>
		];
	}
}


class MainContent_systemPage extends Page {
	header;
	#HTML = {}
	constructor() {
		super({
			renderContentOnOpen: true,
			customClass: 'systemPage'
		});
		
		this.header = new PageHeader({
			pageIconInBox: false,
			pageIconSrc: 'images/settingsIcon.png', 
		});
		this.header.html.leftButton.addEventListener('click', () => MainContent.homePage.open());
		this.header.title = 'System';
	}

	renderContent() {
		this.#HTML.pageContent = <div className='dynamicContentHolder'></div>;
		this.#updateContent()
		return [
			this.header.render(),
			this.#HTML.pageContent
		];
	}

	async setServiceEnableState(_serviceId, _enable) {
		console.log('setServiceEnableState');
		let result = await ServiceManager.setEnableState(_serviceId, _enable);
		if (result !== 'Restarting') return alert(result);
		Server.disconnect();
		let refreshPageInterval;
		refreshPageInterval = setInterval(() => {
			if (!Server.connected) return;
			MainContent.systemPage.open();
			clearInterval(refreshPageInterval)		
		}, 1000)
	}

	async #updateContent() {
		let config = await ServiceManager.getServiceConditions();

		let systemServicePanels = [];
		let enabledServicePanels = [];
		let availableServicePanels = [];

		for (let serviceId in config)
		{
			let serviceCondition = config[serviceId];
			let service = ServiceManager.getService(serviceId);	
			if (!service) service = {iconSrc: '', name: serviceId, id: serviceId} // Only installed, no actual frontend-service available

			if (serviceCondition.enabled)
			{
				if (serviceCondition.isSystemService && service.panel && service.panel.isSystemPagePanel) 
				{
					systemServicePanels.push(service.panel.render());
					continue;
				} 
				let panel = new SystemPagePanel({}, service, serviceCondition);
				enabledServicePanels.push(panel.render());
				continue;
			}

			let panel = new SystemPagePanel({}, service, serviceCondition);
			availableServicePanels.push(panel.render());
		}

		let items = [
			<div className='header'>System Services</div>,
			<div className='PanelBox'>{systemServicePanels}</div>,
			<div className='header'>Enabled Services</div>,
			<div className='PanelBox'>{enabledServicePanels}</div>,
			<div className='header'>Available Services</div>,
			<div className='PanelBox'>{availableServicePanels}</div>
		];

		this.#HTML.pageContent.innerHTML = '';
		for (let item of items) this.#HTML.pageContent.append(item);
	}
}



class MainContent_servicePage extends Page {
	constructor() {
		super();
	}
	
	open(_service) {
		this.#renderPageContent(_service.page);
		return super.open();
	}

	#renderPageContent(_servicePage) {
		this.html.page.innerHTML = '';
		appendContent(this.html.page, _servicePage.renderContent());
	}
}




class MainContent_serviceConfigPage extends Page {
	curService;
	downTimePanel;

	constructor() {
		super({renderContentOnOpen: true});
		this.header = new PageHeader({
			pageIconSrc: 'images/lightBolbOff.png', 
			leftButtonSrc: 'images/backIcon.png', 
			rightButtonSrc: false,
		});
		this.header.html.leftButton.addEventListener('click', () => MainContent.systemPage.open());

		this.downTimePanel = new DownTimePanel({size: [2, 3]});
		this.infoPanel = new ServiceInfoPanel({size: [2, 2]}, this);
	}

	open(_service) {
		this.curService = _service;
		this.header.title = _service.name;
		this.header.pageIconSrc = _service.iconSrc;
		this.infoPanel.updateContent();

		return super.open();
	}

	renderContent() {
		if (!this.curService) return [];
		let request = new RequestMessage({type: 'getDownTime'}, this.curService);
		request.send().then((_data) => this.updateDownTimePanel(_data));
		return [
			this.header.render(),
			<div className='panelBoxHolder'>
				<div className='PanelBox'>
					{ this.infoPanel.render() }
					{ this.downTimePanel.render() }
				</div>
			</div>
		];
	}

	updateDownTimePanel(_data) {
		this.downTimePanel.setData(_data);
	}
}

class ServiceInfoPanel extends Panel {
	#parent;
	#versionHolder;
	#eventHolder;
	#endPointHolder;

	constructor(_config, _parent) {
		super(_config);
		this.#parent = _parent
		this.#versionHolder = <div></div>;
		this.#eventHolder = <div></div>;
		this.#endPointHolder = <div></div>;
		
	}
	render() {
		let html = super.render(...arguments);
		html.classList.add('ServiceInfoPanel')
		return html;
	}

	renderContent() {
		return <div>
			{ new Button({text: 'Identify', onclick: () => this.#parent.curService.identify(), boxy: true}).render() }
			{ this.#versionHolder }
			{ this.#eventHolder }
			{ this.#endPointHolder }
		</div>;
	}

	async updateContent() {
		let info = await this.#parent.curService.getDeviceInfo();
		this.#versionHolder.innerHTML = 'ConnectionManager version: ' + info.connectionManagerVersion;
		this.#eventHolder.innerHTML = '<br>Events:<br>' + JSON.stringify(info.events);
		this.#endPointHolder.innerHTML = '<br>Endpoints:<br>' +  JSON.stringify(info.endPoints);
	}
}


