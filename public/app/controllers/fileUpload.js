 angular.module('fileUpload', ['ngFileUpload'])

 .controller('uploadCtrl', function(UploadService, StageManagerService){
 	var vm = this;

 	vm.submit = function(){
 		
 		if (vm.upload_form.file.$valid && vm.file) //check if from is valid
                vm.upload(vm.file); //call upload function
 		else
 			console.log("nao satisfez condicoes");
 	};

 	vm.upload = function(file){
 		console.log("tentando enviar arquivo");

 		UploadService.uploadImage(file).success(function(resp){
 			console.log("enviou arquivo: " + resp.filePath);
 			StageManagerService.downloadImage(resp.filePath);
 		});

 		
 	};

 });