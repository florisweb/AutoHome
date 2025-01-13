const Auth = new class {
	constructor() {
		window.Auth = this;
	}

	#keyIvSplitter = "&iv=";

	get token() {
		return localStorage.userToken;
	}
	set token(_token) {
		localStorage.userToken = _token;
	}

	clearToken() {
		localStorage.userToken = '';
	}

	getKeyFromURL() {
		try {
			let string = window.location.search.split("?data=")[1];
			let data = string.split("&iv=")[0];
			let iv = string.split("&iv=")[1];

			return data + this.#keyIvSplitter + iv;
		} catch (e) {
			return false;
		}
	}
}

export default Auth;