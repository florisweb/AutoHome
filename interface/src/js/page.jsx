import { setTextToElement, appendContent } from './extraFunctions.js';
import MainContent from './mainContent.jsx';


export class Page {
	html = {}
	#config = {};

	get openState() {
		return !this.html.page.classList.contains('hide');
	}
	constructor(_config = {renderContentOnOpen: false}) {
		this.#config = _config;
	}

	render() {
		this.html.pageContent = <div className='pageContent'>
				{this.renderContent()}
		</div>;
		this.html.page = <div className='page hide'>	
			{this.html.pageContent}
		</div>;
		return this.html.page;
	}

	renderContent() {}


	open() {
		if (MainContent.curPage) MainContent.curPage.close();
		MainContent.curPage = this;
		this.html.page.classList.remove('hide');

		if (!this.#config.renderContentOnOpen) return;
		this.html.pageContent.innerHTML = '';
		appendContent(this.html.pageContent, this.renderContent());		
	}

	close() {
		this.html.page.classList.add('hide');
	}
}
	



export class PageHeader {
	html = {};
	#config =  {
		pageIconSrc: 'images/logoInverted.png', 
		pageIconInBox: true, 
		leftButtonSrc: 'images/backIcon.png', 
		rightButtonSrc: '',
	};

	set title(_newTitle) {
		setTextToElement(this.html.pageTitle, _newTitle);
	}

	constructor(_config = {leftButtonSrc, pageIconSrc, rightButtonSrc, pageIconInBox}) {
		Object.assign(this.#config, _config);
		this.html.pageTitle = <div className='text title'></div>;

		this.html.pageIcon = <img src={this.#config.pageIconSrc} className={'icon overviewIcon ' + (this.#config.pageIconInBox ? 'whiteBackgroundBox' : '')}></img>;
		this.html.leftButton = <img src={this.#config.leftButtonSrc} className='icon overviewIcon overviewButton'></img>;
		this.html.rightButton = <img src={this.#config.rightButtonSrc} className='icon overviewIcon overviewButton'></img>;
		if (!this.#config.leftButtonSrc) this.html.leftButton.classList.add('hide');
		if (!this.#config.rightButtonSrc) this.html.rightButton.classList.add('hide');
	}


	render() {
		this.html.pageOverview = <div className='pageOverview' style='margin-bottom: 50px'>
			<div className='iconHolder'>
				<div>{this.html.leftButton}</div>
				{this.html.pageIcon}
				<div>{this.html.rightButton}</div>
			</div>
			{this.html.pageTitle}
		</div>;

		return this.html.pageOverview;
	}
}

