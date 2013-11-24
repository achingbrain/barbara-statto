var Brew = require(__dirname + "/../../resources/Brew"),
	sinon = require("sinon"),
	should = require("should");

var resource;

module.exports["resources/Brew"] = {
	setUp: function(done) {
		resource = new Brew();

		done();
	},

	"Should find brew": function( test ) {
		var error = null;
		var brew = {};
		resource._brewRepository = {
			findById: sinon.stub().callsArgWith(1, error, brew)
		};
		var brewId = "foo";
		var request = {
			params: {
				brewId: brewId
			},
			reply: function(brew) {
				var findByIdCall = resource._brewRepository.findById.getCall(0);
				findByIdCall.calledWith(brewId, sinon.match.func);

				test.done();
			}
		};

		resource.retrieve(request);
	},

	"Should find all brews": function( test ) {
		var error = null;
		var brews = [];
		resource._brewRepository = {
			findAll: sinon.stub().callsArgWith(0, error, brews)
		};
		var request = {
			query: {},
			reply: function(brews) {
				var findAllCall = resource._brewRepository.findAll.getCall(0);
				findAllCall.calledWith(sinon.match.func);
				brews.should.be.array;

				test.done();
			}
		};

		resource.retrieveAll(request);
	},

	"Should find brews by name": function( test ) {
		var error = null;
		var brew = {};
		resource._brewRepository = {
			findByName: sinon.stub().callsArgWith(1, error, brew)
		};
		var name = "foo";
		var request = {
			query: {
				name: name
			},
			reply: function(brew) {
				var findAllCall = resource._brewRepository.findByName.getCall(0);
				findAllCall.calledWith(sinon.match.func);
				brew.should.not.be.null;

				test.done();
			}
		};

		resource.retrieveAll(request);
	}
};
