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
		})
		.when('/mindmap/:mapId',{
			templateUrl: 'app/views/pages/graph_view.html',
			controller: 'MindMapController',
			controllerAs: 'mindMapCtrl'
		})


	$locationProvider.html5Mode(true);

});