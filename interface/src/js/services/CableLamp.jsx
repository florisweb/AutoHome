let CableLamp;
{
	const panel = new function() {
		const This = this;
		HomePagePanel.call(this, {
			customClass: "CableLamp",
			onRender: render
		});
		let renderOnlineIndicator = this.renderOnlineIndicator;
		function render() {
			let lampStatus = <div className='text subText'>lamp off</div>;
			let toggleButton = new Button({
				text: "Toggle",
				onclick: (_e) => {
					CableLamp.toggleLight();
					_e.stopPropagation();
				}
			});

			let lightBolbIcon = <img className='panelIcon' src='images/lightBolbOn.png'></img>;
			
			let preparedProgramIndicator = 	<div className='preparedProgramIndicator'>
												<img className='alarmIcon' src='images/alarmIcon.png'></img>
												<div className='text'></div>
											</div>;
			This.html.preparedProgramIndicator = preparedProgramIndicator;
			This.html["lampStatus"] 	= lampStatus;
			This.html["lightBolbIcon"] 	= lightBolbIcon;

			This.setLampState(CableLamp.state.lampOn);
			let onlineIndicator = This.renderOnlineIndicator();
			This.setOnlineState(CableLamp.state.deviceOnline);
			This.setPreparedProgramIndicator(CableLamp.state.preparedProgram);

			This.updateContent();
			return [
				lightBolbIcon,
				<div className='text panelTitle'>{This.service.name}</div>,
				onlineIndicator,
				lampStatus,
				<div className='bottomBar'>
					{preparedProgramIndicator}
					{toggleButton.render()}
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





	const page = new function() {
		const This = this;
		ServicePage.call(this);

		let directControlPanel = new function() {
			Panel.call(this, {onRender: onRender, customClass: "directControlPanel h2"});

			let dropDown = new DropDown({options: [
				{
					name: "Morning program",
					value: 0,
				},
				{
					name: "Blink",
					value: 1,
				}
			]});

			let toggleButton = new Button({
				text: "Toggle",
				onclick: (_e) => {
					CableLamp.toggleLight();
					_e.stopPropagation();
				}
			});



			function onRender() {
				return <div>
					<div className='text panelTitle'>Lamp</div>
					{toggleButton.render()},
					{dropDown.render()}
				</div>;
			}
		}

		let triggerPanel = new function() {
			Panel.call(this, {onRender: onRender, customClass: "triggerPanel h2"});
			function onRender() {
				return <div>
					<div className='text panelTitle'>Programs</div>
				</div>;
			}
		}


		this.render = () => {
			this.html.icon = <img src='images/lightBolbOff.png' className='icon whiteBackgroundBox' onclick={() => {CableLamp.toggleLight()}}></img>;
			this.html.self = <div>
				<div className='pageOverview' style='margin-bottom: 50px'>
					{this.html.icon}
					<div className='text title'>{This.service.name}</div>
				</div>
				<div className='pageContent'>
					{directControlPanel.render()}
					{triggerPanel.render()}
				</div>
			</div>
			this.setLampState(this.service.state.lampOn);
			return this.html.self;
		}

		this.setLampState = (_lampOn) => {
			if (!this.html.icon || !this.openState) return console.log('doesn\'t exist yet');
			this.html.icon.setAttribute('src', "images/lightBolb" + (_lampOn ? "On" : "Off") + ".png");
		}
	}









	CableLamp = new function() {
		Service.call(this, {serviceId: 'CableLamp', name: 'Cable Lamp', homeScreenPanel: panel, servicePage: page});
		this.state = {
			lampOn: false
		};

		this.onEvent = (_event) => {
			switch (_event.type)
			{
				case "onlineStatusUpdate": 
					this.state.deviceOnline = _event.data;
					this.homeScreenPanel.setOnlineState(this.state.deviceOnline);
				break;
				case "curState": 
					this.state = _event.data;
					this.homeScreenPanel.setLampState(this.state.lampOn);
					this.servicePage.setLampState(this.state.lampOn);
					this.homeScreenPanel.setOnlineState(this.state.deviceOnline);
					this.homeScreenPanel.setPreparedProgramIndicator(this.state.preparedProgram);
				break;
				case "lampStatus": 
					this.state.lampOn = _event.data;
					this.homeScreenPanel.setLampState(this.state.lampOn); 
					this.servicePage.setLampState(this.state.lampOn);
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
}