

const CableLampPanel = new function() {
	// Panel.call(this);


	this.render = function() {
		return <div class='Component panel CableLamp'>
			<div id="lampStatus">lamp off</div>
			<div id="atHomeStatus">not at home</div>
			<div id="inRoomStatus">not in room</div>


			<button type='button' id='BTN_1'> <h1>ON</h1> </button>
			<button type='button' id='BTN_2'> <h1>OFF</h1> </button>
			<button type='button' id='BTN_3'> <h1>ANIMATE</h1> </button>
		</div>;
	}
}

function CableLamp() {
document.getElementById('BTN_1').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "setLampStatus", data: true}));});
document.getElementById('BTN_2').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "setLampStatus", data: false}));});
document.getElementById('BTN_3').addEventListener('click', () => {Socket.send(JSON.stringify({serviceId: "CableLamp", type: "runLightProgram"}));});


}
