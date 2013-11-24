var BrewRepository = require(__dirname + "/../../repositories/BrewRepository"),
	sinon = require("sinon"),
	should = require("should");

var repository;

module.exports["BrewRepository"] = {
	setUp: function(done) {
		repository = new BrewRepository();
		repository._logger = {
			info: function() {},
			warn: function() {},
			error: function() {},
			debug: function() {}
		};

		done();
	},

	"Should find all brews": function( test ) {
		var error = null;
		var result = {rows: [{}]};
		repository._brewsDb = {
			view: sinon.stub().callsArgWith(2, error, result)
		};

		repository.findAll(function(error, brews) {
			should(error).be.null;
			brews.length.should.be.equal(1);

			test.done();
		});
	},

	"Should error while finding all brews": function( test ) {
		var error = true;
		var result = {rows: [{}]};
		repository._brewsDb = {
			view: sinon.stub().callsArgWith(2, error, result)
		};

		repository.findAll(function(error, brews) {
			should(brews).be.null;
			error.should.be.true;

			test.done();
		});
	},

	"Should find brew by id": function( test ) {
		var error = null;
		var result = {};
		var id = "foo";
		repository._brewsDb = {
			get: sinon.stub().callsArgWith(1, error, result)
		};

		repository.findById(id, function(error, brew) {
			var call = repository._brewsDb.get.getCall(0);
			call.calledWith(id);

			should(error).be.null;
			brew.should.not.be.null;

			test.done();
		});
	},

	"Should error when finding brew by id": function( test ) {
		var error = true;
		var result = {};
		var id = "foo";
		repository._brewsDb = {
			get: sinon.stub().callsArgWith(1, error, result)
		};

		repository.findById(id, function(error, brew) {
			var call = repository._brewsDb.get.getCall(0);
			call.calledWith(id);

			should(brew).be.null;
			error.should.be.true;

			test.done();
		});
	},

	"Should find brew by name": function( test ) {
		var error = null;
		var result = {
			total_rows: 1,
			rows: [{}]
		};
		var name = "foo";
		repository._brewsDb = {
			view: sinon.stub().callsArgWith(3, error, result)
		};

		repository.findByName(name, function(error, brew) {
			var call = repository._brewsDb.view.getCall(0);
			call.calledWith(name);

			should(error).be.null;
			brew.should.not.be.null;

			test.done();
		});
	},

	"Should error when finding brew by name": function( test ) {
		var error = true;
		var result = {
			total_rows: 1,
			rows: [{}]
		};
		var name = "foo";
		repository._brewsDb = {
			view: sinon.stub().callsArgWith(3, error, result)
		};

		repository.findByName(name, function(error, brew) {
			var call = repository._brewsDb.view.getCall(0);
			call.calledWith(name);

			should(brew).be.null;
			error.should.be.true;

			test.done();
		});
	},

	"Should save new brew": function( test ) {
		var error = null;
		var brew = {};
		repository._brewsDb = {
			insert: sinon.stub().callsArgWith(1, error, brew)
		};

		repository.save(brew, function(error, brew) {
			should(error).be.null;
			brew.should.have.property("created_at");

			test.done();
		});
	},

	"Should update brew": function( test ) {
		var error = null;
		var brew = {
			created_at: true
		};
		repository._brewsDb = {
			insert: sinon.stub().callsArgWith(1, error, brew)
		};

		repository.save(brew, function(error, brew) {
			should(error).be.null;
			brew.should.have.property("created_at");
			brew.should.have.property("updated_at");

			test.done();
		});
	},

	"Should update views": function( test ) {
		var data = "{\"foo\":\"bar\",\"baz\":\"qux\"}";
		var existingviews = {

		};
		repository._brewsDb = {
			get: sinon.stub().callsArgWith(1, null, existingviews),
			insert: sinon.stub().callsArgWith(2, null)
		};

		repository._onReadViewFile(null, data);

		var insertCall = repository._brewsDb.insert.getCall(0);
		insertCall.calledWith(sinon.match.obj, sinon.match.string, sinon.match.func);

		// should have updated the hash property
		insertCall.args[0].should.have.property("hash", "8ec457907c57526c9c7b71753ebe5d7e");

		test.done();
	},

	"Should not update views when they have not changed": function( test ) {
		var data = "{\"foo\":\"bar\",\"baz\":\"qux\"}";
		var existingviews = {
			hash: "8ec457907c57526c9c7b71753ebe5d7e"
		};
		repository._brewsDb = {
			get: sinon.stub().callsArgWith(1, null, existingviews),
			insert: sinon.stub().callsArgWith(2, null)
		};

		repository._onReadViewFile(null, data);

		// should not have updated anything
		sinon.assert.notCalled(repository._brewsDb.insert);

		test.done();
	}
};
