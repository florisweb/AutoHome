

const ELumenPanel = new function() {
	const This = this;
	HomePagePanel.call(this, {
		customClass: "ELumen",
		onRender: render
	});
	
	let renderOnlineIndicator = this.renderOnlineIndicator;
	function render() {
		let icon = <img className='panelIcon' src='images/eLumenIcon.png'></img>;
		let state = <div className='text subText waterPercentage'>&#128167;52% filled</div>;
		This.html["icon"] 		= icon;

		let onlineIndicator = This.renderOnlineIndicator();
		This.setOnlineState(This.service.state.deviceOnline);

		return [
			icon,
			state,
			<div className='text panelTitle'>{This.service.name}</div>,
			onlineIndicator,
		];
	}


	this.updateData = function() {

	}
}

const ELumen = new function() {
	Service.call(this, {serviceId: 'ELumen', name: 'eLumen', homeScreenPanel: ELumenPanel});
	this.state = {
		humidty: 0,
		temperature: 0,
	};

	this.onEvent = (_event) => {
		switch (_event.type)
		{
			case "curState": 
				this.state = _event.data;
				this.homeScreenPanel.updateData();
			break;
		}
	}
}
