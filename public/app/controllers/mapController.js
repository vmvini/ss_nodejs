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

	

	$scope.$watch(function(scope){ return scope.mapc.expression; }, function() {
       
		//BUSCANDO MAPAS COM BASE NA STRING DIGITADA NO INPUT DE BUSCA
		MapService.searchMap( { search: vm.expression } )
		.success(function(resp){

			vm.searchResults = resp;
		});


    });


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

	vm.doUpdate = function(){
		console.log("tentando atualizar dados");
	}


	socketio.on('new_map', function(data){
		vm.maps.push(data);
	});


	vm.doLogout = function(){
		Auth.logout();
		$location.path('/');
	}



});