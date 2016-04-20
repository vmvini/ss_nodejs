angular.module('mindmap', [])

.controller('MindMapController', function($scope, Auth, $location, MapService, $routeParams){

	var vm = this;

	vm.mapData = { mapId: $routeParams.mapId };
	

	MapService.getAllMap(vm.mapData)
	.success(function(data){
		console.log(data);
		//funcao esta no mindmapDrawer.js
		drawMindMap(data);
	});


	Auth.getUser().then(function(resp){
		console.log(resp);
		vm.loggedUser = resp.data;
		
	});

	MapService.getById({mapId: vm.mapData.mapId})
	.success(function(resp){
		vm.mapObject = resp;

	});

	MapService.AllMaps()
			  .success(function(data){
			  		vm.maps = data;
			  });


	vm.expression = "amdlaksjqwoejlkwejqlwkejqlxamn";

	$scope.$watch(function(scope){ return scope.mindMapCtrl.expression; }, function() {
       
		//BUSCANDO MAPAS COM BASE NA STRING DIGITADA NO INPUT DE BUSCA
		MapService.searchMap( { search: vm.expression } )
		.success(function(resp){

			vm.searchResults = resp;
		});


    });




	vm.goToMap = function(mapId){
		$location.path('/map/' + mapId);
	}



	vm.doLogout = function(){
		Auth.logout();
		$location.path('/');
	}



});