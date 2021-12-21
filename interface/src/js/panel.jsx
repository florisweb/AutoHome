
function Panel({width, height, onRender}) {
	this.html = {};

	this.render = function() {
		let html = <div class='Panel'>
			{onRender()}
		</div>;

		html.style.width = 'calc(' + width + ' * var(--componentWidth) - 10px * 2)';
    	html.style.height = 'calc(' + height + ' * var(--componentHeight) - 10px * 2)';
		this.html.self = html;
		return html;
	}

}