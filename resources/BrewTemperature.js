var LOG = require("winston"),
	Autowire = require("wantsit").Autowire;

BrewTemperature = function() {
	this._brewRepository = Autowire;
};

BrewTemperature.prototype.retrieve = function(request, response) {
	this._findBrew(request.params.brewId, response, function(brew) {
		var temperature;

		if(!brew.temperature) {
			LOG.error("Brew had no recorded temperatures", request.params.brewId);

			response.code(404);

			return;
		} else {
			temperature = brew.temperature[brew.temperature.length - 1];
		}

		request.reply(temperature);
	});
};

BrewTemperature.prototype.retrieveAll = function(request) {
	this._findBrew(request.params.brewId, response, function(brew) {
		if(!brew.temperature) {
			LOG.error("Brew had no recorded temperatures", request.params.brewId);

			response.code(404);

			return;
		}

		request.reply(brew.temperature);
	});
};

BrewTemperature.prototype.create = function(request) {
	this._findBrew(request.params.brewId, response, function(brew) {
		var temperature;

		if(!brew.temperature) {
			brew.temperature = [];
		}

		brew.temperature.push({
			date: new Date(),
			temperature: request.query.temperature
		});

		request.reply({temperature: temperature});
	});

	request.reply({});
};

BrewTemperature.prototype._findBrew = function(id, response, callback) {
	this._brewRepository.findById(request.params.brewId, function(error, brew) {
		if(error) {
			LOG.error("Could not find brew with id", request.params.brewId);

			response.code(404);

			return;
		}

		callback(brew);
	});
}

module.exports = BrewTemperature;