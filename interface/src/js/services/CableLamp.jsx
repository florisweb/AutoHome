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







	const programs = [
		{
			name: "Morning program",
			id: 0,
		},
		{
			name: "Blink",
			id: 1,
		}
	];


	const page = new function() {
		const This = this;
		ServicePage.call(this);


		let directControlPanel = new function() {
			const CurPanel = this;
			Panel.call(this, {onRender: onRender, customClass: "directControlPanel"});

			this.html.lightBolbIcon = <img className='panelIcon' src='images/lightBolbOn.png'></img>;
			this.html.lampStatus = <div className='text subText'>Lamp On</div>;


			let dropDown = new DropDown({options: programs.map(p => {p.value = p.id; return p})});
			let toggleButton = new Button({
				text: "Toggle",
				customClass: 'toggleButton',
				onclick: (_e) => {
					CableLamp.toggleLight();
					_e.stopPropagation();
				}
			});

			
			this.setLampState = (_lampOn) => {
				if (!this.html.lampStatus || !this.html.lightBolbIcon) return console.log('doesn\'t exist yet');
				setTextToElement(this.html.lampStatus, _lampOn ? "Lamp On" : "Lamp Off");
				this.html.lightBolbIcon.setAttribute('src', "images/lightBolb" + (_lampOn ? "On" : "Off") + ".png");
			}

			function onRender() {
				return [
					CurPanel.html.lightBolbIcon,
					<div className='text panelTitle'>{This.service.name}</div>,
					CurPanel.html.lampStatus,

					toggleButton.render(),
				];
			}
		}

		let alarmPanel = new function() {
			const CurPanel = this;
			Panel.call(this, {onRender: onRender, customClass: "alarmPanel"});

			this.html.icon = <img className='panelIcon' src='images/timerIcon.png'></img>;
			let dropDown = new DropDown({options: programs.map(p => {p.value = p.id; return p})});
			let triggerInputField = new InputField({isTimeInput: true});

			function onRender() {
				return [
					CurPanel.html.icon,
					<div className='text panelTitle centered'>Alarm</div>,
					<div className='inputWrapper'>
						{triggerInputField.render()}
						{dropDown.render()}
					</div>
				];
			}
		}

		let programPanel = new function() {
			const CurPanel = this;
			Panel.call(this, {onRender: onRender, customClass: "programPanel"});

			this.html.icon = <img className='panelIcon' src='images/timerIcon.png'></img>; // TODO: ProgramIcon
			let dropDown = new DropDown({options: programs.map(p => {p.value = p.id; return p})});
			let triggerInputField = new InputField({isTimeInput: true});
			let runButton = new Button({
				text: "Run",
				boxy: true,
				onclick: (_e) => {
					CableLamp.toggleLight();
					_e.stopPropagation();
				}
			});


			function onRender() {
				return [
					CurPanel.html.icon,
					<div className='text panelTitle centered'>Programs</div>,
					<div className='inputWrapper'>
						{runButton.render()}
						{dropDown.render()}
					</div>
				];
			}
		}



		this.render = () => {
			this.html.backButton = <img src='images/backIcon.png' className='icon overviewIcon overviewButton' onclick={() => {MainContent.homePage.open()}}></img>;
			this.html.icon = <img src='images/lightBolbOff.png' className='icon overviewIcon whiteBackgroundBox' onclick={() => {CableLamp.toggleLight()}}></img>;
			this.html.settingsButton = <img src='images/hamburgerIcon.png' className='icon overviewIcon overviewButton' onclick={() => {MainContent.homePage.open()}}></img>;

			this.html.self = <div className='pageContent'>
					<div className='pageOverview' style='margin-bottom: 50px'>
						<div className='iconHolder'>
							<div>{this.html.backButton}</div>
							{this.html.icon}
							<div>{this.html.settingsButton}</div>
						</div>
						<div className='text title'>{This.service.name}</div>
					</div>
					<div className='PanelBox'>
						{directControlPanel.render()}
						{programPanel.render()}
						{alarmPanel.render()}
					</div>
				</div>;
			this.setLampState(this.service.state.lampOn);
			return this.html.self;
		}

		this.setLampState = (_lampOn) => {
			if (!this.html.icon || !this.openState) return console.log('doesn\'t exist yet');
			this.html.icon.setAttribute('src', "images/lightBolb" + (_lampOn ? "On" : "Off") + ".png");
			directControlPanel.setLampState(_lampOn);
		}
	}









	CableLamp = new function() {
		Service.call(this, {serviceId: 'CableLamp', name: 'Cable Lamp', homeScreenPanel: panel, servicePage: page});
		this.state = {
			lampOn: false
		};

		this.programs = programs;

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