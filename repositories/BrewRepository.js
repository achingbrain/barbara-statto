var Autowire = require("wantsit").Autowire,
	fs = require("fs"),
	LOG = require("winston"),
	crypto = require("crypto");

BrewRepository = function() {
	this.brewsDb = Autowire;
};

BrewRepository.prototype.afterPropertiesSet = function() {
	var file = __dirname + "/BrewRepository.json";

	fs.readFile(file, 'utf8', function (err, data) {
		if (err) {
			LOG.error("BrewRepository", "Could not read view file", error);
			throw new Error("Error reading view file " + error.message);
		}

		// calculate the md5 hash of the view definitions - if they haven't changed
		// then we don't need to update them..
		var md5sum = crypto.createHash("md5");
		md5sum.update(data);

		var hash = md5sum.digest("hex");

		data = JSON.parse(data);
		data.hash = hash;

		this.brewsDb.get("_design/brews", function(error, result) {
			if(error && error.status_code != 404) {
				LOG.error("BrewRepository", "Error finding existing view ", error);
				throw new Error("Error finding existing view " + error.message);
			}

			if(result) {
				if(result.hash == data.hash) {
					LOG.info("BrewRepository", "No view update required");

					return;
				} else {
					LOG.info("BrewRepository", "View definitions have changed - will update");
				}

				data._rev = result._rev;
			}

			this.brewsDb.insert(data, "_design/brews", function(error) {
				if(error) {
					LOG.error("BrewRepository", "Could not initialise views");
					throw new Error("Could not initialise views");
				}

				LOG.info("BrewRepository", "Views initialised");
			}.bind(this));
		}.bind(this));
	}.bind(this));
}

BrewRepository.prototype.findAll = function(callback) {
	this.brewsDb.view("brews", "all", function(error, result) {
		callback(error, error ? null : result.rows);
	});
};

BrewRepository.prototype.findById = function(id, callback) {
	this.brewsDb.get(id, function(error, result) {
		callback(error, result);
	});
};

BrewRepository.prototype.findByName = function(name, callback) {
	this.brewsDb.view("brews", "by_name", { key: name }, function(error, result) {
		callback(error, error ? null : result.rows[0]);
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