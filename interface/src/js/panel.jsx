
function Panel({onRender, customClass = ""}) {
	this.html = {};

	this.render = function() {
		let html = <div className={'Panel ' + customClass}>
			{onRender()}
		</div>;

		this.html.self = html;
		return html;
	}

}