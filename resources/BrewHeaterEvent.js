var Autowire = require("wantsit").Autowire;

BrewHeaterEvent = function() {
	this._brewRepository = Autowire;
	this._logger = Autowire
};

BrewHeaterEvent.prototype.retrieveAll = function(request) {
	this._findBrew(request.params.brewId, request, function(brew) {
		if(!brew.heaterEvents) {
			this._logger.error("Brew had no recorded heating events", request.params.brewId);

			request.code(404);

			return;
		}

		request.reply(brew.heaterEvents);
	}.bind(this));
};

BrewHeaterEvent.prototype.create = function(request) {
	this._findBrew(request.params.brewId, request, function(brew) {
		var event = "" + request.payload.event;
		event = event.toUpperCase() == "ON" ? "ON" : "OFF";

		if(!brew.heaterEvents) {
			brew.heaterEvents = [];
		}

		brew.heaterEvents.push({
			date: new Date(),
			event: event
		});

		// persist the new temperature
		this._brewRepository.save(brew);

		request.reply({event: event});
	}.bind(this));
};

BrewHeaterEvent.prototype._findBrew = function(id, request, callback) {
	this._brewRepository.findById(request.params.brewId, function(error, brew) {
		if(error) {
			this._logger.error("Could not find brew with id", request.params.brewId);

			request.code(404);

			return;
		}

		callback(brew);
	}.bind(this));
}

module.exports = BrewHeaterEvent;