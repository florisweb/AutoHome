var Socket; 
function init() { 
	Socket = new WebSocket('ws://localhost:8080/'); 
	Socket.onmessage = function(event) { 
		console.log(event.data);
	};
	Socket.onOpen = () => {
		// Authenticate as interfaceClient
		Socket.send(JSON.stringify({id: "InterfaceClient"}));
	}
}

document.getElementById('BTN_1').addEventListener('click', () => {Socket.send(JSON.stringify({type: "setLampStatus", data: true}));});
document.getElementById('BTN_2').addEventListener('click', () => {Socket.send(JSON.stringify({type: "setLampStatus", data: false}));});
document.getElementById('BTN_3').addEventListener('click', () => {Socket.send(JSON.stringify({type: "runLightProgram"}));});


init();