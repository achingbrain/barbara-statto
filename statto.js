var nconf = require("nconf"),
	Container = require("wantsit").Container,
	bonvoyage = require("bonvoyage"),
	Nano = require("nano"),
	Columbo = require("columbo"),
	Hapi = require("hapi"),
	winston = require("winston"),
	path = require("path");

// set up arguments
nconf.argv().env().file(path.resolve(__dirname, "config.json"));

var container = new Container();
container.register("config", nconf);

// set up logging
container.createAndRegister("logger", winston.Logger, {
	transports: [
		new (winston.transports.Console)({
			timestamp: true,
			colorize: true
		})
	]
});

// database
var connection = new Nano("http://" + nconf.get("couchdb:host") + ":" + nconf.get("couchdb:port"));
container.register("connection", connection);

// create collections
connection.db.create("barbara_brews");
container.register("brewsDb", connection.use("barbara_brews"));

// repositories
container.createAndRegister("brewRepository", require("./repositories/BrewRepository"));

// create a REST api
container.createAndRegister("columbo", Columbo, {
	resourceDirectory: path.resolve(__dirname, nconf.get("rest:resources")),
	resourceCreator: function(resource, name) {
		return container.createAndRegister(name + "Resource", resource);
	}
});

// inject a dummy seaport - we'll overwrite this when the real one becomes available
container.register("seaport", {
	query: function() {
		return [];
	}
});

var bonvoyageClient = new bonvoyage.Client({
	serviceType: nconf.get("registry:name")
});
bonvoyageClient.register({
	role: nconf.get("rest:name"),
	version: nconf.get("rest:version"),
	createService: function(port) {
		var columbo = container.find("columbo");
		var server = Hapi.createServer("0.0.0.0", port, {
			cors: true
		});
		server.addRoutes(columbo.discover());
		server.start();

		container.find("logger").info("RESTServer", "Running at", "http://localhost:" + port);
	}
});
bonvoyageClient.find(function(error, seaport) {
	if(error) {
		container.find("logger").error("Error finding seaport", error);

		return;
	}

	container.find("logger").info("Found seaport server");
});
bonvoyageClient.on("seaportUp", function(seaport) {
	container.register("seaport", seaport);
});
