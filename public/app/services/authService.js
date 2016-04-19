angular.module('authService', [])
/*
{
	criar serviço de nome Auth através do método factory do angular
	$http é um modulo passado automaticamente pela injeção de dependencia do angular
	$q é um promise object do angular, tbm passado por injeção de dependencia do angular
	AuthToken é o nome da proxima fabrica que irei construir, tbm passado por injeção de dependencia
}
*/
.factory('Auth', function($http, $q, AuthToken){

	var authFactory = {};

	authFactory.login = function(email, password){

		/*{
			fazer uma requisiçao post à rota de login
			passando como parametros da requisicao username e password
			e quando com .success, relacionar uma funcao de promessa à resposta do servidor

			quando o servidor responde essa requisicao, 
			o callback associado ao promise .success será chamado, 
			passando para esse callback o objeto json que a resposta oferece
			}
		*/
		return $http.post('/api/login', {

			email: email, 
			password: password
			//o metodo $http.post() retorna um HttpPromise object.
			//PORÉM: HttpPromise.success ESTÁ DEPRECIADO!!!
		}).success(function(data){
				//data aqui é o objeto json recebido pela resposta do server
				AuthToken.setToken(data.token);
				return data;
				/*{
					The $http legacy promise methods success and error have been deprecated. 
					Use the standard then method instead. 
					If $httpProvider.useLegacyPromiseExtensions is set to false then these methods will throw $http/legacy error.
				}
				*/
			} )
	}


	authFactory.logout = function(){
		AuthToken.setToken();
	}

	authFactory.isLoggedIn = function(){
		if(AuthToken.getToken())
			return true;
		else
			return false;
	}


	authFactory.getUser = function(){ //retorna um HttpPromise
		if(AuthToken.getToken())
			return $http.get('/api/me');
		else
			return $q.reject({message:"User has no token"});
	}

	return authFactory;

})


.factory('AuthToken', function($window){

	var authTokenFactory = {};

	authTokenFactory.getToken = function(){
		return $window.localStorage.getItem('token');
	}

	authTokenFactory.setToken = function(token){

		if(token)
			$window.localStorage.setItem('token', token);
		else
			$window.localStorage.removeItem('token');

	}

	return authTokenFactory;

})


//esse serviço serve para verificar em cada requisiçao se existe um token
.factory('AuthInterceptor', function($q, $location, AuthToken){

	var interceptorFactory = {};

	interceptorFactory.request = function(config){
		var token = AuthToken.getToken();

		if(token){
			config.headers['x-access-token'] = token;
		}

		return config;
	}

	interceptorFactory.responseError = function(response){
		if(response.status == 403)
			$location.path('/');

		return $q.reject(response);
	}

	return interceptorFactory;

});