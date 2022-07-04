# AutoHome

AutoHome is a collection of smart devices and projects that integrate and work with one-another. (In the end, that is ;p)





ServerDevice:
- State










<p3>Client-protocol</p3>

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