angular.module('uploadModule', [])

/*
.factory('UploadService', function($http){
	var service = {};
	service.uploadFileToUrl = function(file, url){
		var fd = new FormData();
		fd.append('file', file);
		$http.post(url, fd, {
			transformRequest: angular.identity,
			headers: {'Content-Type':undefined}
		})
		.success(function(){
			console.log("sucesso ao enviar");
		})
		.error(function(){
			console.log("erro ao enviar");
		});
	};

	service.uploadImage = function(file){
		service.uploadFileToUrl(file, "/api/upload");
	}

});*/