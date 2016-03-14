angular.module('mapController', [])

//injeçao de dependencia : MapService e socketio
.controller('MapController', function(MapService, socketio){

	var vm = this;

	MapService.AllMaps()
			  .success(function(data){
			  		vm.maps = data;
			  });

	vm.createMap = function(){
		MapService.create(vm.mapData)
			.success(function(data){
				vm.mapData = '';
				console.log("Mapa criado");
				
			});
	};

	socketio.on('new_map', function(data){
		vm.maps.push(data);
	});


});