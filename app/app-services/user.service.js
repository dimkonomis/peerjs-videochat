(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('UserService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.GetCurrent = GetCurrent;
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
		service.Streaming = Streaming;
		service.Disconnect = Disconnect;
 
        return service;
 
        function GetCurrent() {
            return $http.get('/api/users/current').then(handleSuccess, handleError);
        }
 
        function GetAll() {
            return $http.get('/api/users/all').then(handleSuccess, handleError);
        }
 
        function GetById(_id) {
            return $http.get('/api/users/' + _id).then(handleSuccess, handleError);
        }
 
        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError);
        }
 
        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }
		
		function Streaming(user,streamId) {
            return $http.put('/api/users/' + user._id+'/'+streamId, user).then(handleSuccess, handleError);
        }
		
		function Disconnect(user) {
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
        }
 
        // private functions
 
        function handleSuccess(res) {
            return res.data;
        }
 
        function handleError(res) {
            return $q.reject(res.data);
        }
    }
 
})();