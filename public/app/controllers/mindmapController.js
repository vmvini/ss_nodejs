angular.module('mindmap', [])

.controller('MindMapController', function(MapService, $routeParams){

	var vm = this;

	vm.mapData = { mapId: $routeParams.mapId };
	

	MapService.getAllMap(vm.mapData)
	.success(function(data){
		console.log(data);
		//funcao esta no mindmapDrawer.js
		drawMindMap(data);
	});


});