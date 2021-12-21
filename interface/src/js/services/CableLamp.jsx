

const CableLampPanel = new function() {
	const This = this;
	Panel.call(this, {
		width: 2,
		height: 2,
		onRender: render
	});
	function render() {
		let lampStatus = <div class='text'>lamp off</div>;
		let toggleButton = <div className='button bDefault text'>Toggle</div>;
		toggleButton.onclick = () => {CableLamp.toggleLight()}
		This.html = {
			toggleButton: toggleButton, 
			lampStatus: lampStatus
		};
		This.setLampStatus(CableLamp.lampOn);
		return [
			lampStatus,
			toggleButton,
		];
	}

	this.setLampStatus = (_lampOn) => {
		if (!This.html.lampStatus) return console.log('doesn\'t exist yet');
		setTextToElement(This.html.lampStatus, _lampOn ? "Lamp On" : "Lamp Off");
	}

}

const CableLamp = new function() {
	Service.call(this, {serviceId: 'CableLamp'});
	this.state = {
		lampOn: false
	};

	this.onEvent = (_event) => {
		switch (_event.type)
		{
			case "curState": 
				this.state = _event.data;
				console.log(this.state.lampOn);
				CableLampPanel.setLampStatus(this.state.lampOn);
			break;
			case "lampStatus": 
				this.state.lampOn = _event.data;
				CableLampPanel.setLampStatus(this.state.lampOn); 
			break;
		}
	}

	// document.getElementById('BTN_1').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "setLampStatus", data: true}));});
	// document.getElementById('BTN_2').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "setLampStatus", data: false}));});
	// document.getElementById('BTN_3').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "runLightProgram"}));});


	this.toggleLight = function() {
		return this.setLightState(!this.state.lampOn);
	}

	this.setLightState = function(_lampOn) {
		return this.send({type: "setLampStatus", data: _lampOn})
	}
}
