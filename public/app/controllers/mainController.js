angular.module('MainControllerModule', [])

.controller('MainController', function(UserService, UploadService){

	var vm = this;

	vm.complete = false;

	vm.error = false;

	vm.hasSubmited = false;
	
	vm.doRegistration = function(){


		if (vm.regForm.file.$valid && vm.file){ //verificando se tem imagem

			UploadService.uploadImage(vm.file).success(function(resp){
	 			
	 			vm.usuario.image = resp.filePath;

	 			UserService.register(vm.usuario)
				.success(function(resp){
					if(resp.success)
						vm.complete = true;
					else
						vm.error = true;
				});
			});
		}
		else{
			vm.usuario.image = "/site_img/user.jpg";
			UserService.register(vm.usuario)
				.success(function(resp){
					if(resp.success)
						vm.complete = true;
					else
						vm.error = true;
				});
		}
	

		


		
	};



});