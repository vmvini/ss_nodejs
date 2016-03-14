angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider){

	$routeProvider
		.when('/', {
			templateUrl: 'app/views/pages/my_maps.html',
			controller: 'MapController',
			controllerAs:'mapc'
		});
		


	$locationProvider.html5Mode(true);

});