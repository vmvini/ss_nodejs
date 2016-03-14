angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider){

	$routeProvider
		.when('/', {
			templateUrl: 'app/views/pages/my_maps.html',
			controller: 'MapController',
			controllerAs:'mapc'
		})
		.when('/map/:mapId',{
			templateUrl: 'app/views/pages/free_area.html',
			controller: 'FreeAreaController',
			controllerAs: 'fareac'
		});


	$locationProvider.html5Mode(true);

});