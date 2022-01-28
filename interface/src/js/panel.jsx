
function Panel({onRender, customClass = ""}) {
	this.html = {};

	this.renderOnlineIndicator = function() {
		let html = <div className='onlineIndicator'></div>;
		this.html.onlineIndicator = html;
		return html;
	}
	this.setOnlineState = function(_isOnline) {
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