angular.module('freeArea', [])

.controller('FreeAreaController', function($scope, Auth, $location, MapService, ImageService, TextMarksService,  socketio, $routeParams, StageManagerService, StageConfigurator){

//	console.log($routeParams.mapId);

	var vm = this;

	vm.mapData = { mapId: $routeParams.mapId };
	
	StageConfigurator.config(vm.mapData.mapId);


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

	$scope.$watch(function(scope){ return scope.fareac.expression; }, function() {
       
		//BUSCANDO MAPAS COM BASE NA STRING DIGITADA NO INPUT DE BUSCA
		MapService.searchMap( { search: vm.expression } )
		.success(function(resp){

			vm.searchResults = resp;
		});


    });




	vm.goToMap = function(mapId){
		$location.path('/map/' + mapId);
	}


	MapService.AllFirstNodes(vm.mapData)
		.success(function(data){

			ImageService.getImages({parentId: vm.mapData.mapId})
			.success(function(images){
				
				if(images.length > 0){
					images.forEach(function(image){
						StageManagerService.downloadImage(image.path, image._id, image.x, image.y);
					});
				}
				
			})
			

			vm.firstNodes = data;

			vm.firstNodes.forEach(function(each){
				var text = each.text || each.content;
				
				TextMarksService.allTextMarks({ textId: each._id } )
					.success(function(marks){
						StageManagerService.addText(text, each.posx, each.posy, marks, each.html, { id:each._id });
						console.log("nós desenhados");
					});
				
			});
			
		});

	
	

		vm.doLogout = function(){
			Auth.logout();
			$location.path('/');
		}






});