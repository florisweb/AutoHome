

const ELumenPanel = new function() {
	const This = this;
	Panel.call(this, {
		customClass: "ELumen",
		onRender: render
	});
	let renderOnlineIndicator = this.renderOnlineIndicator;
	function render() {
		// let lampStatus = <div className='text'>lamp off</div>;

		// let lightBolbIcon = <img className='panelIcon' src='images/lightBolbOn.png'></img>;
		// This.html["lampStatus"] = lampStatus;
		// This.html["lightBolbIcon"] = lightBolbIcon;


		// let onlineIndicator = This.renderOnlineIndicator();
		// This.setOnlineState(CableLamp.state.deviceOnline);

		return [
			// lightBolbIcon,
			<div className='text panelTitle'>eLumen</div>
			// onlineIndicator,
			// lampStatus,
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
