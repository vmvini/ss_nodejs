angular.module('mapService', [])

.factory('MapService', function($http){

	var mapFactory = {};

	mapFactory.create = function(mapData){
		return $http.post('/api/insertMindMap', mapData);
	};


	mapFactory.AllMaps = function(){
		return $http.get('/api/getAllMaps');
	};

	mapFactory.AllFirstNodes = function(mapData){
		return $http.post('/api/allFirstLevelNodes', mapData);
	};

	return mapFactory;


})


.factory('socketio', function($rootScope){

	var socket =  io.connect();

	return{
		on: function(eventName, callback){
			socket.on(eventName, function(){
				var args = arguments;
				$rootScope.$apply(function(){
					callback.apply(socket, args);
				});
			});
		},

		emit: function(eventName, data, callback){
			socket.emit(eventName, data, function(){
				var args = arguments;
				$rootScope.apply(function(){
					if(callback){
						callback.apply(socket,args);
					}
				});
			});
		}

	};

});