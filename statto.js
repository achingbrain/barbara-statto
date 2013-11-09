var nconf = require("nconf"),
	Container = require("wantsit").Container,
	bonvoyage = require("bonvoyage"),
	Nano = require("nano"),
	Columbo = require("columbo"),
	Hapi = require("hapi"),
	LOG = require("winston");

// set up arguments
nconf.argv().env().file("config.json");

var container = new Container();
container.register("config", nconf);

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
	resourceDirectory: nconf.get("rest:resources"),
	resourceCreator: function(resource, name) {
		return container.createAndRegister(name + "Resource", resource);
	}
});

var bonvoyageClient = new bonvoyage.Client({
	serviceType: nconf.get("registry:name")
});
bonvoyageClient.find(function(error, seaport) {
	if(error) {
		LOG.error("Could not find SeaPort", error);

		return;
	}

	container.register("seaport", seaport);
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

		LOG.info("RESTServer", "Running at", "http://localhost:" + port);
	}
});
