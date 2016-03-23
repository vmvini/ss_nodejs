angular.module('freeArea', [])

.controller('FreeAreaController', function(MapService, TextMarksService,  socketio, $routeParams, StageManagerService, StageConfigurator){

//	console.log($routeParams.mapId);

	var vm = this;

	vm.mapData = { mapId: $routeParams.mapId };
	
	StageConfigurator.config(vm.mapData.mapId);


	MapService.AllFirstNodes(vm.mapData)
		.success(function(data){
			vm.firstNodes = data;

			vm.firstNodes.forEach(function(each){
				var text = each.text || each.content;
				
				TextMarksService.allTextMarks({ textId: each._id } )
					.success(function(marks){
						StageManagerService.addText(text, each.posx, each.posy, marks, each.html, { id:each._id });
					});
				
			});
			
		});

	
	





});