angular.module('freeArea', [])

.controller('FreeAreaController', function(MapService, socketio, $routeParams, StageManagerService, StageConfigurator){

//	console.log($routeParams.mapId);

	var vm = this;

	vm.mapData = { mapId: $routeParams.mapId };
	
	MapService.AllFirstNodes(vm.mapData)
		.success(function(data){
			vm.firstNodes = data;
			console.log(vm.firstNodes);
			
		});

	StageConfigurator.config();

	





});