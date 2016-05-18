var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');
 
var service = {};
 
service.authenticate = authenticate;
service.getById   = getById;
service.getUsersAll    = getUsersAll;
service.create    = create;
service.streaming = streaming;
module.exports = service;
 
function authenticate(username, password) {
    var deferred = Q.defer();
 
    db.users.findOne({ username: username }, function (err, user) {
        if (err) deferred.reject(err);
 
        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve(jwt.sign({ sub: user._id }, config.secret));
        } else {
            // authentication failed
            deferred.resolve();
        }
    });
 
    return deferred.promise;
}
 
function getById(_id) {
    var deferred = Q.defer();
 
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err);
 
        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });
 
    return deferred.promise;
}
 
function getUsersAll(_id) {
    var deferred = Q.defer();
	var result = [];
    db.users.find(function(err, users) {
	  if( err || !users) console.log("No users found");
	  else  {
		  users.forEach( function(User) {
			  result.push(User)
			  deferred.resolve(result);
		  })
		}
	});

    return deferred.promise;
}
 
function create(userParam) {
    var deferred = Q.defer();
 
    // validation
    db.users.findOne(
        { username: userParam.username },
        function (err, user) {
            if (err) deferred.reject(err);
 
            if (user) {
                // username already exists
                deferred.reject('Username "' + userParam.username + '" is already taken');
            } else {
                createUser();
            }
        });
 
    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');
        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);
		user.streaming = false;
		user.streamId = null;
 
        db.users.insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err);
 
                deferred.resolve();
            });
    }
 
    return deferred.promise;
}
 
function streaming(_id, userStreamId, stream, userParam) {
    var deferred = Q.defer();
    // validation
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err);
            updateUser();
        
    });
 
    function updateUser() {
        // fields to update
        var set = {
            streaming: stream,
			streamId: userStreamId,
            
        };
 
        db.users.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err);
 
                deferred.resolve();
            });
    }
 
    return deferred.promise;
} 
 