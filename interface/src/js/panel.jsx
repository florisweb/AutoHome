
function Panel({onRender, customClass = ""}) {
	this.html = {};
	let isOnline = false;
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
	this.render = function() {
		let html = <div className={'Panel animateIn ' + customClass}>
			{onRender()}
		</div>;

		this.html.self = html;
		return html;
	}
}