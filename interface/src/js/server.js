var Socket; 
function init() { 
	Socket = new WebSocket('ws://' + window.location.hostname + ':8081/'); 
	Socket.onmessage = function(event) { 
		let message = JSON.parse(event.data);
		console.log(message);

		if (message.type != 'status' && message.type != 'lampStatus') return;
		switch (message.serviceId)
		{
			case "CableLamp": lampStatus.innerHTML = message.data ? 'lamp on' : 'lamp off'; break;
			case "MovementTracker": 
				atHomeStatus.innerHTML = message.isAtHome ? 'is home' : 'is not home'; 
				inRoomStatus.innerHTML = message.isInRoom ? 'is in room' : 'is not in room'; 
			break;
		}
	};
	Socket.onopen = function() {
		// Authenticate as interfaceClient
		Socket.send(JSON.stringify({id: "InterfaceClient", key: localStorage.userKey}));
	}
}

document.getElementById('BTN_1').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "setLampStatus", data: true}));});
document.getElementById('BTN_2').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "setLampStatus", data: false}));});
document.getElementById('BTN_3').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "runLightProgram"}));});


init();