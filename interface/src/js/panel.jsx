
function Panel({onRender, postRender, customClass = "", size = [1, 1]}) {
	const This = this;
	this.html = {};
	
	this.render = function() {
		let html = <div className={'Panel animateIn ' + customClass}>
			{onRender()}
		</div>;
		html.style.width = 'calc(var(--componentWidth) * ' + size[0] + ' - 10px * 2)'; 
		html.style.height = 'calc(var(--componentHeight) * ' + size[1] + ' - 10px * 2)'; 

		this.html.self = html;
		if (typeof postRender === 'function') postRender(html)
		return html;
	}
}

function HomePagePanel(_params = {onRender, customClass}) {
	const This = this;
	Panel.call(this, {..._params, postRender: postRender});

	this.service = false;
	
	let isOnline = false;
	function postRender(_html) {
		_html.addEventListener('click', () => {
			if (!This.service.servicePage) return;
			MainContent.servicePage.open(This.service);
		});
	}


	this.renderOnlineIndicator = function() {
		let html = <div className='onlineIndicator'></div>;
		this.html.onlineIndicator = html;
		this.setOnlineState(isOnline);
		return html;
	}
	this.setOnlineState = function(_isOnline) {
		isOnline = _isOnline;
		if (!this.html.onlineIndicator) return;

		this.html.onlineIndicator.classList.remove("online");
		if (!_isOnline) return;
		this.html.onlineIndicator.classList.add("online");
	}
}


function GraphPanel(_params = {panelTitle, customClass: "", xLabel, yLabel}) {
	Panel.call(this, {
		..._params,
		onRender: onRender, 
		customClass: (_params.customClass ? _params.customClass : '') + " graphPanel"
	});

	let graph = new Graph(...arguments);
	this.setData = function(_lines) {
		graph.setData(_lines);
	}

	function onRender() {
		return [
			<div className='text panelTitle small'>{_params.panelTitle}</div>,
			graph.render()
		];
	}
}




function DownTimePanel(_params = {customClass: ''}) {
	Panel.call(this, {..._params, onRender: onRender, customClass: (_params.customClass ? _params.customClass : '') + " graphPanel downTimePanel"});

	let downTimeGraph = new DownTimeGraph();
	this.setData = function() {
		return downTimeGraph.setData(...arguments);
	}
	
	function onRender() {
		return [
			<div className='text panelTitle small'>Downtime</div>,
			downTimeGraph.render()
		];
	}
}