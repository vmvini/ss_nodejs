angular.module('mapController', [])

//injeçao de dependencia : MapService e socketio
.controller('MapController', function($scope, MapService, socketio, Auth, $location){

	var vm = this;

	Auth.getUser().then(function(resp){
		console.log(resp);
		vm.loggedUser = resp.data;
		vm.loggedUser.senha1 = "senha";
		vm.loggedUser.senha2 = "senha";
	});



	vm.goToMap = function(mapId){
		$location.path('/map/' + mapId);
	}

	vm.changed = function(mapItem){
		console.log("atributo mudou");
		//console.log(mapItem);	
		MapService.updateMap(mapItem).success(function(resp){
			console.log("resposta de atualização de permissao de mapa");
			console.log(resp);
		});
	}


	$scope.$watch(function(scope){ return scope.mapc.expression; }, function() {
       
		//BUSCANDO MAPAS COM BASE NA STRING DIGITADA NO INPUT DE BUSCA
		MapService.searchMap( { search: vm.expression } )
		.success(function(resp){

			vm.searchResults = resp;
		});


    });

    $scope.$watch(function(scope){return scope.mapc.maps}, function(){
    	console.log("ocorreu mudança em maps");
    });


	MapService.AllMaps()
			  .success(function(data){
			  		vm.maps = data;
			  });



	vm.createMap = function(){
		vm.createdMap = false;

		vm.mapData.creator = vm.loggedUser.name;
		vm.mapData.visibility = "private";

		MapService.create(vm.mapData)
			.success(function(data){
				vm.mapData = '';
				console.log("Mapa criado");
				vm.createdMap = true;

			});
	};

	vm.doUpdate = function(){
		console.log("tentando atualizar dados");
	}


	socketio.on('new_map', function(data){
		if(data.creator == vm.loggedUser.name )
			vm.maps.push(data);
	});


	vm.showDialog = function(map){
		bootbox.confirm("Deseja realmente remover: "+map.name+"?", function(result) {
			if(result === true){
				
				MapService.removeMap({id: map._id })
				.success(function(data){
					console.log("mapa removido com sucesso");
					var pos = vm.maps.indexOf(map);
					if(pos !== -1)
						vm.maps.splice(pos, 1);
				});

			}

		}); 
	}


	vm.doLogout = function(){
		Auth.logout();
		$location.path('/');
	}



	function scrollToAnchor(aid){
	    var aTag = $("#"+ aid );
	    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
	}

	vm.goToAnchor = function(anchorId){
		scrollToAnchor(anchorId);
	}





});