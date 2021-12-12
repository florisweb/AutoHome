var Socket; 
function init() { 
	Socket = new WebSocket('ws://localhost:8080/'); 
	Socket.onmessage = function(event) { 
		console.log(event.data);
	}; 
}

document.getElementById('BTN_1').addEventListener('click', button_1_pressed);
function button_1_pressed() { 
	Socket.send(JSON.stringify({type: 1, data: true})); 
} 

init();