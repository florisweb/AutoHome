

const ELumenPanel = new function() {
	const This = this;
	Panel.call(this, {
		customClass: "ELumen",
		onRender: render
	});
	let renderOnlineIndicator = this.renderOnlineIndicator;
	function render() {
		let lampStatus = <div className='text'>lamp off</div>;

		let lightBolbIcon = <img className='panelIcon' src='images/lightBolbOn.png'></img>;
		This.html["lampStatus"] = lampStatus;
		This.html["lightBolbIcon"] = lightBolbIcon;

		This.setLampStatus(CableLamp.lampOn);
		let onlineIndicator = This.renderOnlineIndicator();
		This.setOnlineState(CableLamp.state.deviceOnline);

		return [
			lightBolbIcon,
			<div className='text panelTitle'>eLumen</div>,
			onlineIndicator,
			lampStatus,
		];
	}

	this.setLampStatus = (_lampOn) => {
		if (!this.html.lampStatus) return console.log('doesn\'t exist yet');
		setTextToElement(this.html.lampStatus, _lampOn ? "Lamp On" : "Lamp Off");
		this.html.lightBolbIcon.setAttribute('src', "images/lightBolb" + (_lampOn ? "On" : "Off") + ".png");
	}

	this.updateData = function() {

	}
}

const ELumen = new function() {
	Service.call(this, {serviceId: 'ELumen', name: 'eLumen'});
	this.state = {
		humidty: 0,
		temperature: 0,
	};

	this.onEvent = (_event) => {
		switch (_event.type)
		{
			case "curState": 
				this.state = _event.data;
				ELumenPanel.updateData();
			break;
		}
	}


	this.toggleLight = function() {
		return this.setLightState(!this.state.lampOn);
	}

	this.setLightState = function(_lampOn) {
		return this.send({type: "setLampStatus", data: _lampOn})
	}
}
