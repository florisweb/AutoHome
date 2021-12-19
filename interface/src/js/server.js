var Socket; 
function init() { 
	Socket = new WebSocket('ws://' + window.location.hostname + ':8081/'); 
	Socket.onmessage = function(event) { 
		let message = JSON.parse(event.data);
		console.log(message);

		if (message.error == "Invalid Key") return Auth.clearKey();

		if (message.type != 'status' && message.type != 'lampStatus') return;
		switch (message.serviceId)
		{
			// case "CableLamp": lampStatus.innerHTML = message.data ? 'lamp on' : 'lamp off'; break;
			case "MovementTracker": 
				// atHomeStatus.innerHTML = message.isAtHome ? 'is home' : 'is not home'; 
				// inRoomStatus.innerHTML = message.isInRoom ? 'is in room' : 'is not in room'; 
			break;
		}
	};
	Socket.onopen = function() {
		// Authenticate as interfaceClient
		Socket.send(JSON.stringify({id: "InterfaceClient", key: Auth.getKey()}));
	}
}
init();