

export class Service {


	// @Overwrite
	async setup() {}
	
 	onLoadRequiredServices(_serviceInterfaces) {}
    onWantedServiceLoad(_serviceInterface) {}
}

export class ServiceState {
	export() {
		return this;
	}
}