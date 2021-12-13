var Socket; 
function init() { 
	let domain = window.location.origin;
	if (domain != 'localhost') domain = domain.split('://')[1];
	Socket = new WebSocket('ws://' + domain + ':8080/'); 
	Socket.onmessage = function(event) { 
		console.log(event.data);
		message.innerHTML = event.data;
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