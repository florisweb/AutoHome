
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
						<div className='pageHeader'>
							<div className='text titleHolder'>Title</div>
						</div>
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
		return <div>
			{CableLampPanel.render()}
		</div>;
	}

}



