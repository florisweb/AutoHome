
{
	const panel = new function() {
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
			this.setOnlineState(this.service.state.deviceOnline);
		}
	}


	const page = new function() {
		const This = this;
		ServicePage.call(this);

		let moisturePanel = new function() {
			GraphPanel.call(this, {panelTitle: "Moisture", customClass: "w2 h3", xLabel: "Time", yLabel: "Moisture (%)", yRange: [0, 100]});
		}

		let waterVolumePanel = new function() {
			GraphPanel.call(this, {panelTitle: "Water Volume", customClass: "w2 h3", xLabel: "Time", yLabel: "WaterVolume (%)", yRange: [0, 100]});
		}



		this.render = () => {
			this.html.backButton = <img src='images/backIcon.png' className='icon overviewIcon overviewButton' onclick={() => {MainContent.homePage.open()}}></img>;
			this.html.icon = <img src='images/eLumenIcon.png' className='icon overviewIcon whiteBackgroundBox'></img>;
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
						{moisturePanel.render()}
						{waterVolumePanel.render()}
					</div>
				</div>;


			this.service.send({type: "getData"})

			return this.html.self;
		}

		this.updateData = () => {

		}
		
		this.updateGraph = (_data) => {
			updateMoistureGraph(_data);
			updateWaterVolumeGraph(_data);
		}

		function updateMoistureGraph(_data) {
			let lines = [[], [], [], []];
			for (let row of _data)
			{
				let time = row.time / 1000;
				lines[0].push([
					time,
					row.data.humidity
				]);
				lines[1].push([
					time,
					row.data.moisture1
				]);
				lines[2].push([
					time,
					row.data.moisture2
				]);
			}

			moisturePanel.setData(lines);
		}

		function updateWaterVolumeGraph(_data) {
			let lines = [[]];
			for (let row of _data)
			{
				let time = row.time / 1000;
				lines[0].push([
					time,
					row.data.volumePerc
				]);
			}

			waterVolumePanel.setData(lines);
		}
	}




	const ELumen = new function() {
		Service.call(this, {serviceId: 'ELumen', name: 'eLumen', homeScreenPanel: panel, servicePage: page});
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
					this.servicePage.updateData();
				break;
				case "data": 
					this.servicePage.updateGraph(_event.data);
				break;
			}
		}
	}

}