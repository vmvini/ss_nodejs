angular.module('freeArea', [])

.controller('FreeAreaController', function(MapService, socketio, $routeParams, StageService){

//	console.log($routeParams.mapId);

	var vm = this;

	vm.mapData = { mapId: $routeParams.mapId };
	
	MapService.AllFirstNodes(vm.mapData)
		.success(function(data){
			vm.firstNodes = data;
			console.log(vm.firstNodes);
			vm.firstNodes.forEach(function(each){
				console.log(each.text);
				StageService.addText(each.text, 0, 0);
			});
		});

	





});