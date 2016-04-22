angular.module('logsystem', [])

.factory('LogService', function($http){

	var logger = {};

	/*
		message = { message: message  }
	*/
	logger.save = function(message){
		return $http.post('/api/saveLog', { date: new Date(), message:message});
	};


	return logger;

});