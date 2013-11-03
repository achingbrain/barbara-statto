var common = require("../brewbot-common"),
	nconf = require("nconf"),
	Container = require("wantsit").Container,
	bonvoyage = require("bonvoyage"),
	Nano = require('nano'),
	Columbo = require("columbo");

// set up arguments
nconf.argv().env().file("config.json");

var container = new Container();
container.register("config", nconf);

// database
var connection = new Nano("http://" + nconf.get("couchdb:host") + ":" + nconf.get("couchdb:port"));
container.register("connection", connection);

// create collections
connection.db.create("brews");
container.register("brewsDb", connection.use("barbara_brews"));

// repositories
container.createAndRegister("brewRepository", require("./repositories/BrewRepository"));

// create a REST api
container.createAndRegister("resourceDiscoverer", Columbo, {
	resourceCreator: function(resource, name) {
		return container.createAndRegister(name, resource);
	}
});
container.createAndRegister("restServer", common.rest.RESTServer);

var bonvoyageClient = new bonvoyage.Client({
	serviceType: nconf.get("registry:name")
});
bonvoyageClient.find(function(error, seaport) {
	container.register("seaport", seaport);
});
bonvoyageClient.register({
	role: nconf.get("rest:name"),
	version: nconf.get("rest:version"),
	createService: function(port) {
		var restServer = container.find("restServer");
		restServer.start(port);
	}
});
