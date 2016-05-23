angular.module('MainControllerModule', [])

.controller('MainController', function(UserService, UploadService, Auth, $rootScope, $location){

	var vm = this;

	vm.reg_complete = false;

	vm.reg_error = false;

	vm.hasSubmited = false;

	//boolean que indica se usuario está logado ou não
	vm.loggedIn = Auth.isLoggedIn();

	//para cada requisição em alguma rota: verificar se ta logado
	$rootScope.$on('$routeChangeStart', function(){

		vm.loggedIn = Auth.isLoggedIn();

		Auth.getUser() //Auth.getUser() retorna um HttpPromise que possui o metodo then()
			.then(function(data){
				vm.user = data.data;

			});

	}); // fim do $rootScope.$on()
	
	if(vm.loggedIn){
		console.log("indo para maps");
		$location.path('/me');
	}
	else{
		console.log("ninguem logado");
	}

	//METODO PARA REALIZAR LOGIN
	vm.doLogin = function(){
		console.log("função doLogin executando");
		vm.processing = true;

		vm.error = '';

		Auth.login(vm.loginData.email, vm.loginData.password)
			.success(function(data){
				vm.processing = false;

				Auth.getUser()
					.then(function(data){
						vm.user = data.data;
						console.log(vm.user);
					});

				if(data.success){
					console.log("sucesso no login");
					$location.path('/me'); //COLOCAR AQUI PAGINA DE PERFIL DO USER
				}
				else{
					console.log(data);
					vm.error = data.message;
				}
			});

	} //fim vm.doLogin()


	vm.doLogout = function(){
		Auth.logout();
		$location.path('/');
	}




	//CADASTRO DE USUARIO
	vm.doRegistration = function(){


		if (vm.regForm.file.$valid && vm.file){ //verificando se tem imagem

			UploadService.uploadImage(vm.file).success(function(resp){
	 			
	 			vm.usuario.image = resp.filePath;

	 			UserService.register(vm.usuario)
				.success(function(resp){
					if(resp.success)
						vm.reg_complete = true;
					else{
						vm.reg_error = true;
						console.log(resp);
					}
				});
			});
		}
		else{
			vm.usuario.image = "/site_img/user.jpg";
			UserService.register(vm.usuario)
				.success(function(resp){
					if(resp.success)
						vm.reg_complete = true;
					else
						vm.reg_error = true;
				});
		}
	

		


		
	};



});