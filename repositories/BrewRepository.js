var Autowire = require("wantsit").Autowire,
	fs = require("fs"),
	crypto = require("crypto");

BrewRepository = function() {
	this._brewsDb = Autowire;
	this._logger = Autowire;
};

BrewRepository.prototype.afterPropertiesSet = function() {
	this._updateViews();
}

BrewRepository.prototype._updateViews = function() {
	var file = __dirname + "/BrewRepository.json";

	// upgrade stored procedures if necessary
	fs.readFile(file, "utf8", this._onReadViewFile.bind(this));
}

BrewRepository.prototype._onReadViewFile = function(error, contents) {
	if (error) {
		this._logger.error("BrewRepository", "Could not read view file", error);
		throw new Error("Error reading view file " + error.message);
	}

	// calculate the md5 hash of the view definitions - if they haven't changed
	// then we don't need to update them..
	var md5sum = crypto.createHash("md5");
	md5sum.update(contents);

	var hash = md5sum.digest("hex");

	var data = JSON.parse(contents);
	data.hash = hash;

	this._brewsDb.get("_design/brews", function(error, result) {
		if(error && error.status_code != 404) {
			this._logger.error("BrewRepository", "Error finding existing views ", error);
			throw new Error("Error finding existing views " + error.message);
		}

		if(result) {
			if(result.hash == data.hash) {
				this._logger.info("BrewRepository", "No view update required");

				return;
			} else {
				this._logger.info("BrewRepository", "View definitions have changed - will update");
			}

			data._rev = result._rev;
		}

		this._brewsDb.insert(data, "_design/brews", function(error) {
			if(error) {
				this._logger.error("BrewRepository", "Could not initialise views");
				throw new Error("Could not initialise views");
			}

			this._logger.info("BrewRepository", "Views initialised");
		}.bind(this));
	}.bind(this));
};

BrewRepository.prototype.findAll = function(callback) {
	this._brewsDb.view("brews", "all", function(error, result) {
		callback(error, error ? null : result.rows);
	});
};

BrewRepository.prototype.findById = function(id, callback) {
	this._brewsDb.get(id, function(error, result) {
		callback(error, result);
	});
};

BrewRepository.prototype.findByName = function(name, callback) {
	this._brewsDb.view("brews", "by_name", { key: name }, function(error, result) {
		callback(error, error && result.total_rows > 0 ? null : result.rows[0]);
	});
};

BrewRepository.prototype.save = function(brew, callback) {
	if(!brew.created_at) {
		brew.created_at = new Date();
	} else {
		brew.updated_at = new Date();
	}

	this._brewsDb.insert(brew, callback);
};

module.exports = BrewRepository;