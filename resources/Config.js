var Autowire = require("wantsit").Autowire;

Config = function() {
	this._config = Autowire;
	this._seaport = Autowire;
};

Config.prototype.retrieveOne = function(request) {
	var config = {
		type: "api",
		upstream: []
	};

	// add registry connection
	this._seaport.query(this._config.get("registry:service") + "@" + this._config.get("registry:version")).forEach(function(service) {
		config.upstream.push({
			role: this._config.get("registry:service"),
			version: this._config.get("registry:version"),
			host: service.host + ":" + service.port,
			weight: 0.5
		});
	}.bind(this));

	request.reply(config);
};

Config.prototype.toString = function() {
	return "Brew resource"
}

module.exports = Config;