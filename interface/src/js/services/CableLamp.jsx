

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
		
		let preparedProgramIndicator = 	<div className='preparedProgramIndicator'>
											<img className='alarmIcon' src='images/alarmIcon.png'></img>
											<div className='text'></div>
										</div>;
		This.html.preparedProgramIndicator = preparedProgramIndicator;
		This.html["toggleButton"] 	= toggleButton;
		This.html["lampStatus"] 	= lampStatus;
		This.html["lightBolbIcon"] 	= lightBolbIcon;

		This.setLampState(CableLamp.state.lampOn);
		let onlineIndicator = This.renderOnlineIndicator();
		This.setOnlineState(CableLamp.state.deviceOnline);
		This.setPreparedProgramIndicator(CableLamp.state.preparedProgram);

		This.updateContent();

		return [
			lightBolbIcon,
			<div className='text panelTitle'>Cable Lamp</div>,
			onlineIndicator,
			lampStatus,
			<div className='bottomBar'>
				{preparedProgramIndicator}
				{toggleButton}
			</div>
		];
	}

	this.setLampState = (_lampOn) => {
		if (!this.html.lampStatus) return console.log('doesn\'t exist yet');
		setTextToElement(this.html.lampStatus, _lampOn ? "Lamp On" : "Lamp Off");
		this.html.lightBolbIcon.setAttribute('src', "images/lightBolb" + (_lampOn ? "On" : "Off") + ".png");
	}

	this.setPreparedProgramIndicator = (_program) => {
		let text = '';
		This.html.preparedProgramIndicator.classList.add("hide");
		if (_program && _program.trigger) 	
		{
			This.html.preparedProgramIndicator.classList.remove("hide");
			text = _program.trigger;
		}
		setTextToElement(This.html.preparedProgramIndicator.children[1], text);
	}

	this.updateContent = () => {
		CableLamp.send({type: "getPreparedProgram"});
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
				CableLampPanel.setPreparedProgramIndicator(this.state.preparedProgram);
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
