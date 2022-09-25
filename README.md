# AutoHome

AutoHome is a collection of smart devices and projects that integrate and work with one-another. (In the end, that is ;p)





ServerDevice:
- State










<p3>Client-protocol</p3>

<p2>Connecting and Authentication</p2>
1. Client starts connection to websocketserver.
2. OnConnect:
	Client sends auth message: 
		{id: deviceId/serviceId, key}
	Special case, interfaceClient: 
		{id: 'InterfaceClient', key: FloriswebAuthToken}
3. Server Responses
	InterfaceClient:
		{"type": "auth", "status": true}
		{"type": "auth", "status": false, "error": "Invalid Key"}


	{error: "Parameters missing"}
	{error: "Invalid request"}
















<p2>Message types</p2>

<p1>Push</p1>
{
	type: (string)
	data: (any)
	serviceId
}

<p1>Request</p1>
Request: {
	requestId
	type: (string)
	data: (any)
	serviceId,
}
Response: {
	isResponse: true,
	requestId - request.requestId
	response: (any) - response
}








<p2>Messages</p2>
Default Format:
{
	type: (string)
	data: (any)
	serviceId
}

Request, extends Format: {
	...
	requestId: (string) - internal usage
}







SetStateByKey: [device -> server]
- Sets a particular key's value on the servers object.
- Request: {
	type: 'setStateByKey',
	stateKey: (string)
	data: (any)
}

GetStateByKey: [server -> any]
- Returns a particular key's value on the servers object.
- Request: {
	type: 'getStateByKey',
	stateKey: (string)
}


GetState: [server -> any]
- Returns the current state on the servers object.
- Request: {
	type: 'getState',
}
- Return: StateUpdate



CurState: [server -> any]
- Request: {
	type: 'curState',
	data: state (any)
}














servic.page.render()
-> returns div.panelBox