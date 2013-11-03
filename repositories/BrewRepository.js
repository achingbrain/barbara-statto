var Autowire = require("wantsit").Autowire;

BrewRepository = function() {
	this.brewsDb = Autowire;
};

BrewRepository.prototype.findAll = function(callback) {
	this.brewsDb.list({
		include_docs: true
	}, function(error, result) {
		var docs = [];

		if(result.rows) {
			result.rows.forEach(function (row) {
				docs.push(row.doc);
			});
		}

		callback(error, docs);
	});
};

BrewRepository.prototype.findById = function(id, callback) {
	this.brewsDb.get(id, function(error, result) {
		callback(error, result);
	});
};

BrewRepository.prototype.save = function(brew, callback) {
	if(!brew.created_at) {
		brew.created_at = new Date();
	} else {
		brew.updated_at = new Date();
	}

	this.brewsDb.insert(brew, callback);
};

module.exports = BrewRepository;