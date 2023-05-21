import GestureManager from './gestureManager.js';
import { DownTimePanel } from './panel.jsx';
import { ServiceManager } from './service.jsx';
import { Page, PageHeader } from './page.jsx' ;

import { RequestMessage } from './server/message.js';


const MainContent = new function() {
	const This = this;
	const HTML = {
		mainContent: mainContent
	}
	
	this.curPage;
	
	this.setup = function() {
		this.homePage 			= new MainContent_homePage();
		this.servicePage 		= new MainContent_servicePage();
		this.serviceConfigPage 	= new MainContent_serviceConfigPage();
		this.render();
		this.homePage.open();
	}
	
	this.render = function() {
		HTML.mainContent.append(this.homePage.render());
		HTML.mainContent.append(this.servicePage.render());
		HTML.mainContent.append(this.serviceConfigPage.render());

		let lastSwipe = new Date();
		GestureManager.onSwipeRight(HTML.mainContent, function(_dx, _dy, _start) {
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
			pageIconSrc: 'images/logoInverted.png', 
		});
		this.header.title = 'ThuisWolk';
	}

	renderContent() {
		let servicePanels = [];
		for (let service of ServiceManager.services)
		{
			if (!service.panel) continue;
			servicePanels.push(service.panel.render());
		}

		return [
			this.header.render(),
			<div className='PanelBox'>{servicePanels}</div>
		];
	}
}

class MainContent_servicePage extends Page {
	constructor() {
		super();

	}
	open() {
		this.#renderPageContent();
		return super.open();
	}

	#renderPageContent(_servicePage) {
		this.html.page.innerHTML = '';
		this.html.page.append(_servicePage.render());
	}
}




class MainContent_serviceConfigPage extends Page {
	curService;
	downTimePanel;

	constructor() {
		super();
		this.header = new PageHeader({
			pageIconSrc: 'images/lightBolbOff.png', 
			leftButtonSrc: 'images/backIcon.png', 
			rightButtonSrc: '',
		});
		this.header.html.leftButton.addEventListener('click', () => MainContent.homePage.open());

		this.downTimePanel = new DownTimePanel({size: [2, 3]});

		// let placeHolderButton 	= <img className='icon overviewIcon overviewButton' style='opacity: 0'></img>;
	}

	open(_service) {
		this.curService = _service;
		this.header.title = _service.name;
		this.renderPageContent(_service);

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
					{ this.downTimePanel.render() }
				</div>
			</div>
		];
	}
	// renderPageContent(_service) {
	// 	let pageContent = <div className='pageContent'>
	// 		<div className='pageOverview' style='margin-bottom: 50px'>
	// 			<div className='iconHolder'>
	// 				<div>{backButton}</div>
	// 				{icon}
	// 				<div>{placeHolderButton}</div>
	// 			</div>
	// 			<div className='text title'>{_service.name}</div>
	// 		</div>
	// 		<div className='panelBoxHolder'>
	// 			<div className='PanelBox'>
	// 				{downTimePanel.render()}
	// 			</div>
	// 		</div>
	// 	</div>;
	// 	backButton.onclick = () => {
	// 		MainContent.servicePage.open(_service);
	// 	}

	// 	This.HTML.page.innerHTML = '';
	// 	This.HTML.page.append(pageContent);
	// }


	updateDownTimePanel(_data) {
		console.log(_data);
		this.downTimePanel.setData(_data);
	}
}



