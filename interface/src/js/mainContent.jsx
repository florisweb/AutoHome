
function _MainContent() {
	const HTML = {
		mainContent: mainContent
	}
	this.homePage 		= new MainContent_homePage();
	this.servicePage 	= new MainContent_servicePage();
	this.curPage;
	
	this.setup = function() {
		this.render();
		this.homePage.open();
	}
	
	this.render = function() {
		mainContent.append(this.homePage.render());
		mainContent.append(this.servicePage.render());
	}
}


function MainContent_page({index, pageRenderer, onOpen, onClose}) {
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


function MainContent_homePage() {
	MainContent_page.call(this, {
		index: 0, 
		pageRenderer: render,
		onOpen: onOpen
	});

	function onOpen() {

	}


	function render() {
		let servicePanels = [];
		for (let service of ServiceManager.services)
		{
			if (!service.homeScreenPanel) continue;
			servicePanels.push(service.homeScreenPanel.render());
		}

		return <div>
			<div className='pageOverview'>
				<img src='images/logoInverted.png' className='icon overviewIcon'></img>
				<div className='text title'>ThuisWolk</div>
			</div>
			<div className='PanelBox'>
				{servicePanels}
			</div>
		</div>;
	}
}
function MainContent_servicePage() {
	MainContent_page.call(this, {
		index: 0, 
		pageRenderer: render,
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


	function render() {
		return <div></div>;
	}
}



