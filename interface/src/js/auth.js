const Auth = new function() {
	const keyIvSplitter = "&iv=";

	this.getKey = function() {
		if (localStorage.userKey) return localStorage.userKey;
		try {
			let string = window.location.search.split("?data=")[1];
			let data = string.split("&iv=")[0];
			let iv = string.split("&iv=")[1];

			localStorage.userKey = data + keyIvSplitter + iv;
			return localStorage.userKey;
		} catch (e) {
			return false;
		}
	}

	this.clearKey = function() {
		localStorage.userKey = '';
	}


	this.setProxyKey = function(_key) {localStorage.proxyKey = _key}
	this.getProxyKey = function() {return localStorage.proxyKey}
}
