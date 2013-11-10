var LOG = require("winston"),
	Autowire = require("wantsit").Autowire;

BrewTemperature = function() {
	this._brewRepository = Autowire;
};

BrewTemperature.prototype.retrieveAll = function(request) {
	this._findBrew(request.params.brewId, request, function(brew) {
		if(!brew.temperatures) {
			LOG.error("Brew had no recorded temperatures", request.params.brewId);

			request.code(404);

			return;
		}

		request.reply(brew.temperatures);
	});
};

BrewTemperature.prototype.create = function(request) {
	this._findBrew(request.params.brewId, request, function(brew) {
		var celsius = request.payload.celsius;
		celsius = parseFloat((celsius).toFixed(4));

		if(!brew.temperatures) {
			brew.temperatures = [];
		}

		brew.temperatures.push({
			date: new Date(),
			celsius: celsius
		});

		// persist the new temperature
		this._brewRepository.save(brew);

		request.reply({celsius: celsius});
	}.bind(this));
};

BrewTemperature.prototype._findBrew = function(id, request, callback) {
	this._brewRepository.findById(request.params.brewId, function(error, brew) {
		if(error) {
			LOG.error("Could not find brew with id", request.params.brewId);

			request.code(404);

			return;
		}

		callback(brew);
	});
}

module.exports = BrewTemperature;