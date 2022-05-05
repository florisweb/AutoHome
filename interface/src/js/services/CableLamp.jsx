{
	const service = {
		serviceId: 'CableLamp',
		name: 'Cable Lamp',
		icon: 'images/lightBolbOn.png',
	};

	const panel = new function() {
		const This = this;
		HomePagePanel.call(this, {
			customClass: "CableLamp hasIcon hasButtonBar",
			onRender: render,
			size: [1, 2]
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
			This.setPreparedProgramIndicator(CableLamp.state.alarm);

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
		ServicePage.call(this, {
			serviceInfo: service,
			headerConfig: {
				pageIconInBox: true,
			},
			pageRenderer: onRender
		});


		let directControlPanel = new function() {
			const CurPanel = this;
			Panel.call(this, {onRender: onRender, customClass: "directControlPanel"});

			this.html.lightBolbIcon = <img className='panelIcon' src='images/lightBolbOn.png'></img>;
			this.html.lampStatus = <div className='text subText'>Lamp On</div>;

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
			this.dropDown = new DropDown({onChange: updateAlarm});
			let triggerInputField = new InputField({isTimeInput: true, onBlur: updateAlarm});

			function onRender() {
				return [
					CurPanel.html.icon,
					<div className='text panelTitle centered'>Alarm</div>,
					<div className='inputWrapper'>
						{triggerInputField.render()}
						{CurPanel.dropDown.render()}
					</div>
				];
			}

			function updateAlarm() {
				if (!CurPanel.dropDown.value) return;
				This.service.send({type: "prepareProgram", data: {
					trigger: triggerInputField.getValue(),
					program: CurPanel.dropDown.value.program,
					programIndex: CurPanel.dropDown.value.index
				}})
			}
			this.setAlarmData = function(_alarm) {
				if (!triggerInputField.html.self) return;
				triggerInputField.html.self.value = _alarm.trigger;
				if (CurPanel.dropDown.options.length <= _alarm.programIndex) return;
				
				let programIndex = _alarm.programIndex;
				if (typeof programIndex != 'number') programIndex = CurPanel.dropDown.options.length - 1;
				CurPanel.dropDown.setValue(CurPanel.dropDown.options[programIndex].value);
			}
		}

		let programPanel = new function() {
			const CurPanel = this;
			Panel.call(this, {onRender: onRender, customClass: "programPanel"});

			this.html.icon = <img className='panelIcon' src='images/executeIcon.png'></img>;
			this.dropDown = new DropDown();
			let runButton = new Button({
				text: "Run",
				boxy: true,
				onclick: (_e) => {
					if (!CurPanel.dropDown.value) return;
					This.service.send({type: "executeGivenProgram", data: CurPanel.dropDown.value.program});
					_e.stopPropagation();
				}
			});


			function onRender() {
				return [
					CurPanel.html.icon,
					<div className='text panelTitle centered'>Programs</div>,
					<div className='inputWrapper'>
						{runButton.render()}
						{CurPanel.dropDown.render()}
					</div>
				];
			}
		}




		function onRender() {
			This.html.self = <div className='PanelBox'>
				{directControlPanel.render()}
				{programPanel.render()}
				{alarmPanel.render()}
			</div>;
			
			This.service.send({type: "getPrograms"});
			This.updateContent();
			return This.html.self;
		}

		this.setLampState = (_lampOn) => {
			if (!this.html.icon || !this.openState) return console.log('doesn\'t exist yet');
			this.html.icon.setAttribute('src', "images/lightBolb" + (_lampOn ? "On" : "Off") + ".png");
			directControlPanel.setLampState(_lampOn);
		}

		function updatePrograms() {
			let options = This.service.programs.map((_program, _index) => {_program.value = _program; _program.value.index = _index; return _program});
			let alarmOptions = [...options, {name: 'No Alarm', value: {index: false, program: []}}];
			alarmPanel.dropDown.setOptions(alarmOptions);
			programPanel.dropDown.setOptions(options);
		}

		this.updateContent = function() {
			this.setLampState(this.service.state.lampOn);
			updatePrograms();
			alarmPanel.setAlarmData(this.service.state.alarm);
		}
	}









	let CableLamp = new function() {
		Service.call(this, {serviceId: 'CableLamp', name: 'Cable Lamp', homeScreenPanel: panel, servicePage: page});
		this.getIconSrc = function() {
			return this.state.lampOn ? 'images/lightBolbOn.png' : 'images/lightBolbOff.png';
		}

		this.state = {
			lampOn: false
		};

		this.programs = [];
		this.onEvent = (_event) => {
			switch (_event.type)
			{
				case "onlineStatusUpdate": 
					this.state.deviceOnline = _event.data;
					this.homeScreenPanel.setOnlineState(this.state.deviceOnline);
				break;
				case "curState": 
					this.state = _event.data;
					this.servicePage.updateContent();
					this.homeScreenPanel.setLampState(this.state.lampOn);
					this.homeScreenPanel.setOnlineState(this.state.deviceOnline);
					this.homeScreenPanel.setPreparedProgramIndicator(this.state.alarm);
				break;
				case "lampStatus": 
					this.state.lampOn = _event.data;
					this.homeScreenPanel.setLampState(this.state.lampOn); 
					this.servicePage.setLampState(this.state.lampOn);
				break;
				case "programs": 
					this.programs = _event.data;
					this.servicePage.updateContent();
				break;
				case "downTime":
					MainContent.serviceConfigPage.updateDownTimePanel(_event.data);
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