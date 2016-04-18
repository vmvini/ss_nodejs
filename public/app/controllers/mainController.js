angular.module('MainControllerModule', [])

.controller('MainController', function(MapService, socketio){

	var vm = this;

	


	vm.hasSubmited = false;
	
	vm.doRegistration = function(){
		vm.hasSubmited = true;
		console.log("fazendo cadastro");
	};



});