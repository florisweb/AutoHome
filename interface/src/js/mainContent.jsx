
function _MainContent() {
	const This = this;
	const HTML = {
		mainContent: mainContent
	}
	this.homePage 			= new MainContent_homePage();
	this.servicePage 		= new MainContent_servicePage();
	this.serviceConfigPage 	= new MainContent_serviceConfigPage();
	this.curPage;
	
	this.setup = function() {
		this.render();
		this.homePage.open();
	}
	
	this.render = function() {
		mainContent.append(this.homePage.render());
		mainContent.append(this.servicePage.render());
		mainContent.append(this.serviceConfigPage.render());

		let lastSwipe = new Date();
		GestureManager.onSwipeRight(mainContent, function(_dx, _dy, _start) {
			if (_start[0] > 150 || Math.abs(_dx) < 50) return;
			if (new Date() - lastSwipe < 400) return;
			lastSwipe = new Date();
			if (This.servicePage.openState) return This.homePage.open();
			if (This.serviceConfigPage.openState) return This.servicePage.open(This.serviceConfigPage.curService);
		});
	}
}


function MainContent_page({pageRenderer, onOpen, onClose}) {
	this.HTML = {};
	this.openState = false;
	this.render = function() {
		this.HTML.page = <div className='page hide'>	
						<div className='pageContent'>
							{pageRenderer()}
						</div>
					</div>;
		return this.HTML.page;
	}

	this.open = function() {
		if (MainContent.curPage) MainContent.curPage.close();
		MainContent.curPage = this;
		this.openState = true;
		this.HTML.page.classList.remove('hide');
		try {
			return onOpen(...arguments);
		} catch (e) {console.error("Error while opening page", e)};
	}

	this.close = function() {
		this.openState = false;
		this.HTML.page.classList.add('hide');
		try {
			return onClose(...arguments);
		} catch (e) {console.error("Error while closing page", e)};
	}
}

function MainContent_pageWithHeader({
		pageRenderer, 
		title, 
		headerConfig = {pageIconSrc: 'images/logoInverted.png', pageIconInBox: true, leftButtonSrc: 'images/backIcon.png', rightButtonSrc: ''}, 
		onOpen, 
		onClose
	}) {
	const This = this;
	MainContent_page.call(this, {
		...arguments[0],
		pageRenderer: render
	});

	this.HTML.pageIcon = <img src={headerConfig.pageIconSrc} className={'icon overviewIcon ' + (headerConfig.pageIconInBox ? 'whiteBackgroundBox' : '')}></img>;
	this.HTML.leftButton = <img src={headerConfig.leftButtonSrc} className='icon overviewIcon overviewButton'></img>;
	this.HTML.rightButton = <img src={headerConfig.rightButtonSrc} className='icon overviewIcon overviewButton'></img>;
	if (!headerConfig.leftButtonSrc) this.HTML.leftButton.classList.add('hide');
	if (!headerConfig.rightButtonSrc) this.HTML.rightButton.classList.add('hide');


	console.log(title);
	function render() {
		return [
			<div className='pageOverview' style='margin-bottom: 50px'>
				<div className='iconHolder'>
					<div>{This.HTML.leftButton}</div>
					{This.HTML.pageIcon}
					<div>{This.HTML.rightButton}</div>
				</div>
				<div className='text title'>{title}</div>
			</div>,
			<div className='PanelBox'>
				{pageRenderer()}
			</div>
		];
	}
}


function MainContent_homePage() {
	MainContent_pageWithHeader.call(this, {
		pageRenderer: render,
		title: "ThuisWolk",
		headerConfig: {
			pageIconSrc: 'images/logoInverted.png',
			pageIconInBox: false,
		}
	});


	function render() {
		let servicePanels = [];
		for (let service of ServiceManager.services)
		{
			if (!service.homeScreenPanel) continue;
			servicePanels.push(service.homeScreenPanel.render());
		}

		return servicePanels;
	}
}

function MainContent_servicePage() {
	MainContent_page.call(this, {
		pageRenderer: () => <div>Loading...</div>,
		onOpen: onOpen
	});
	const This = this;

	function onOpen(_service) {
		renderPageContent(_service.servicePage);
	}

	function renderPageContent(_servicePage) {
		This.HTML.page.innerHTML = '';
		This.HTML.page.append(_servicePage.render());
	}
}


function MainContent_serviceConfigPage() {
	MainContent_page.call(this, {
		pageRenderer: () => <div>Loading...</div>,
		onOpen: onOpen
	});
	const This = this;
	this.curService = false;

	function onOpen(_service) {
		This.curService = _service;
		renderPageContent(_service);
	}

	let downTimePanel = new DownTimePanel({customClass: "w2 h3"})
	let backButton = <img src='images/backIcon.png' className='icon overviewIcon overviewButton' onclick={() => {MainContent.homePage.open()}}></img>;
	let icon = <img src='images/lightBolbOff.png' className='icon overviewIcon whiteBackgroundBox' onclick={() => {CableLamp.toggleLight()}}></img>;
	let placeHolderButton = <img className='icon overviewIcon overviewButton' style='opacity: 0'></img>;

	function renderPageContent(_service) {
		_service.send({type: "getDownTime"});
		let pageContent = <div className='pageContent'>
			<div className='pageOverview' style='margin-bottom: 50px'>
				<div className='iconHolder'>
					<div>{backButton}</div>
					{icon}
					<div>{placeHolderButton}</div>
				</div>
				<div className='text title'>{_service.name}</div>
			</div>
			<div className='PanelBox'>
				{downTimePanel.render()}
			</div>
		</div>;
		backButton.onclick = () => {
			MainContent.servicePage.open(_service);
		}

		This.HTML.page.innerHTML = '';
		This.HTML.page.append(pageContent);
	}


	this.updateDownTimePanel = function(_data) {
		downTimePanel.setData(_data);
	}
}



