
function _MainContent() {
	const HTML = {
		mainContent: mainContent
	}
	this.homePage = new MainContent_homePage();

	this.setup = function() {
		this.render();
	}
	
	this.render = function() {
		mainContent.append(this.homePage.render());
	}

	this.setup();
}


function MainContent_page({index, pageRenderer, onOpen}) {
	const HTML = {};
	this.render = function() {
		HTML.page = <div className='page'>	
						<div className='pageContent'>
							{pageRenderer()}
						</div>
					</div>;
		return HTML.page;
	}

	this.open = function() {

		try {
			return onOpen(...arguments);
		} catch (e) {console.error("Error while opening page", e)};
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
			servicePanels.push(service.homeScreenPanel.render())
		}

		return <div>
			<div className='pageOverview'>
				<img src='images/logoInverted.png' className='icon'></img>
				<div className='text title'>HomePage</div>
			</div>
			{servicePanels}
		</div>;
	}

}



