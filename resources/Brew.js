var Autowire = require("wantsit").Autowire;

Brews = function() {
	this._brewRepository = Autowire;
};

Brews.prototype.retrieve = function(request) {
	this._brewRepository.findById(request.params.brewId, function(error, brew) {
		request.reply(brew);
	});
};

Brews.prototype.retrieveAll = function(request) {
	if(request.query.name) {
		this._brewRepository.findByName(request.query.name, function(error, brew) {
			if(!brew) {
				request.reply({}).code(404);

				return;
			}

			request.reply(brew);
		});
	} else {
		this._brewRepository.findAll(function(error, brews) {
			request.reply(brews);
		});
	}
};

module.exports = Brews;
