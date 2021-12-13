var Socket; 
function init() { 
	let domain = window.location.origin;
	if (domain != 'localhost') domain = domain.split('://')[1];
	Socket = new WebSocket('ws://' + domain + ':8080/'); 
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
		Socket.send(JSON.stringify({id: "InterfaceClient"}));
	}
}

document.getElementById('BTN_1').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "setLampStatus", data: true}));});
document.getElementById('BTN_2').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "setLampStatus", data: false}));});
document.getElementById('BTN_3').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "runLightProgram"}));});


init();