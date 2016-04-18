angular.module('userService', [])

.factory('UserService', function($http){

	var service = {};

	service.register = function(data){
		return $http.post('/api/registerUser', data);
	};

	service.login = function(data){
		return $http.post('/api/login', data);
	}

	return service;

});