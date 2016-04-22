angular.module('MyApp', ['logsystem','authService','appRoutes', 'mapService', 'userService', 'mapController', 'easel', 'freeArea', 'mindmap', 'fileUpload', 'MainControllerModule', 'directives'])
.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptor');
});