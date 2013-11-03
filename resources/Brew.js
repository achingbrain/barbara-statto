var LOG = require("winston"),
	Autowire = require("wantsit").Autowire;

Brews = function() {
	this._brewRepository = Autowire;
};

Brews.prototype.retrieve = function(request) {
	this._brewRepository.findById(request.params.brewId, function(error, brew) {
		request.reply(brew);
	});
};

Brews.prototype.retrieveAll = function(request) {
	this._brewRepository.findAll(function(error, brews) {
		request.reply(brews);
	});
};

Brews.prototype.create = function(request) {
	request.reply({});
};

Brews.prototype.update = function(request) {
	request.reply({});
};

Brews.prototype.patch = function(request) {
	request.reply({});
};

Brews.prototype.remove = function(request) {
	request.reply({});
};

module.exports = Brews;