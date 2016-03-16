angular.module('freeArea', [])

.controller('FreeAreaController', function(MapService, socketio, $routeParams, StageManagerService, StageConfigurator){

//	console.log($routeParams.mapId);

	var vm = this;

	vm.mapData = { mapId: $routeParams.mapId };
	
	StageConfigurator.config(vm.mapData.mapId);


	MapService.AllFirstNodes(vm.mapData)
		.success(function(data){
			vm.firstNodes = data;

			vm.firstNodes.forEach(function(each){
				var text = each.text || each.content;
				StageManagerService.addText(text, each.posx, each.posy, { id:each._id });
			});
			
		});

	
	





});