{
	const service = {
		serviceId: 'Elumen',
		name: 'eLumen',
		icon: 'images/eLumenIcon.png',
	};

	const panel = new function() {
		const This = this;
		HomePagePanel.call(this, {
			customClass: "ELumen hasIcon",
			onRender: render,
			size: [1, 1]
		});
		
		let renderOnlineIndicator = this.renderOnlineIndicator;
		function render() {
			let icon = <img className='panelIcon' src='images/eLumenIcon.png'></img>;
			let state = <div className='text subText waterPercentage'>&#128167;52% filled</div>;
			This.html["icon"] = icon;

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
		ServicePage.call(this, {
			serviceInfo: service,
			headerConfig: {
				pageIconInBox: true,
			},
			pageRenderer: onRender,
		});

		let moisturePanel = new function() {
			GraphPanel.call(this, {
				panelTitle: "Moisture", 
				size: [2, 3],
				xLabel: "Time", 
				yLabel: "Moisture (%)", 
				xRange: [Date.now() / 1000 -  60 * 60 * 24 * 5, Date.now() / 1000],
				yRange: [0, 100]
			});
		}

		let waterVolumePanel = new function() {
			GraphPanel.call(this, {
				panelTitle: "Water Volume", 
				size: [2, 3],
				xLabel: "Time", 
				yLabel: "WaterVolume (%)", 
				xRange: [Date.now() / 1000 -  60 * 60 * 24 * 5, Date.now() / 1000],
				yRange: [0, 100]
			});
		}


		function onRender() {
			This.html.self = <div className='PanelBox'>
						{moisturePanel.render()}
						{waterVolumePanel.render()}
					</div>;


			This.service.send({type: "getData"});

			return This.html.self;
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
		Service.call(this, {...service, homeScreenPanel: panel, servicePage: page});
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
				case "downTime": 
					MainContent.serviceConfigPage.updateDownTimePanel(_event.data);
				break;
			}
		}
	}
}