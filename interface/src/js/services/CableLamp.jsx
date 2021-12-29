

const CableLampPanel = new function() {
	const This = this;
	Panel.call(this, {
		customClass: "CableLamp",
		onRender: render
	});
	let renderOnlineIndicator = this.renderOnlineIndicator;
	function render() {
		let lampStatus = <div className='text'>lamp off</div>;
		let toggleButton = <div className='button bDefault text'>Toggle</div>;
		toggleButton.onclick = () => {CableLamp.toggleLight()}

		let lightBolbIcon = <img className='panelIcon' src='images/lightBolbOn.png'></img>;
		This.html["toggleButton"] = toggleButton;
		This.html["lampStatus"] = lampStatus;
		This.html["lightBolbIcon"] = lightBolbIcon;

		This.setLampStatus(CableLamp.lampOn);
		let onlineIndicator = This.renderOnlineIndicator();
		This.setOnlineState(CableLamp.state.deviceOnline);

		return [
			lightBolbIcon,
			<div className='text panelTitle'>Cable Lamp</div>,
			onlineIndicator,
			lampStatus,
			<div className='bottomBar'>
				{toggleButton}
			</div>
		];
	}

	this.setLampState = (_lampOn) => {
		if (!this.html.lampStatus) return console.log('doesn\'t exist yet');
		setTextToElement(this.html.lampStatus, _lampOn ? "Lamp On" : "Lamp Off");
		this.html.lightBolbIcon.setAttribute('src', "images/lightBolb" + (_lampOn ? "On" : "Off") + ".png");
	}

}

const CableLamp = new function() {
	Service.call(this, {serviceId: 'CableLamp', name: 'Cable Lamp'});
	this.state = {
		lampOn: false
	};

	this.onEvent = (_event) => {
		switch (_event.type)
		{
			case "onlineStatusUpdate": 
				this.state.deviceOnline = _event.data;
				CableLampPanel.setOnlineState(this.state.deviceOnline);
			break;
			case "curState": 
				this.state = _event.data;
				CableLampPanel.setLampState(this.state.lampOn);
				CableLampPanel.setOnlineState(this.state.deviceOnline);
			break;
			case "lampStatus": 
				this.state.lampOn = _event.data;
				CableLampPanel.setLampState(this.state.lampOn); 
			break;
		}
	}



	this.toggleLight = function() {
		return this.setLampState(!this.state.lampOn);
	}

	this.setLampState = function(_lampOn) {
		return this.send({type: "setLampState", data: _lampOn})
	}
}
