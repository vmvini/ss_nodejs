angular.module('mapService', [])

.factory('UploadService', function($http){
	var service = {};
	service.uploadFileToUrl = function(file, url){
		var fd = new FormData();
		fd.append('file', file);
		return $http.post(url, fd, {
			transformRequest: angular.identity,
			headers: {'Content-Type':undefined}
		});
		
	};

	service.uploadImage = function(file){
		return service.uploadFileToUrl(file, "/upload");
	}

	return service;

})


.factory('ImageService', function($http){

	var imageService = {};

	imageService.getImages = function(data){
		return $http.post('/api/getImages', data);

	};

	imageService.addImage = function(data){
		return $http.post('/api/addImage', data);
	};

	imageService.removeImage = function(data){
		return $http.post('/api/removeImage', data);
	}

	return imageService;

})


.factory('TextMarksService', function($http){

	var textMarkService = {};

	textMarkService.persist = function(textMarkData){
		return $http.post('/api/persistTextMark', textMarkData);
	};

	textMarkService.allTextMarks = function(textData){
		return $http.post('/api/allTextMarks', textData);
	};

	textMarkService.removeTextMark = function(textMarkData){
		return $http.post('/api/removeTextMark', textMarkData);
	};

	textMarkService.detachTextMarkFromTextNode = function(data){
		return $http.post('/api/detachTextMarkFromTextNode', data);
	};

	textMarkService.updateTextMark = function(textMarkData){
		return $http.post('/api/updateTextMark', textMarkData);
	};

	textMarkService.relateMarks = function(data){
		//data = ({ parentId: stageFactory.currentFrame.markId, newMarkId: resp._id } )
		return $http.post('/api/relateMarks', data);

	}


	return textMarkService;

})


.factory('MapService', function($http){

	var mapFactory = {};

	mapFactory.create = function(mapData){
		return $http.post('/api/insertMindMap', mapData);
	};


	mapFactory.AllMaps = function(){
		return $http.get('/api/getAllMaps');
	};

	mapFactory.AllFirstNodes = function(mapData){
		return $http.post('/api/allFirstLevelNodes', mapData);
	};


	mapFactory.insertTextNode = function(textNodeData){
		/*/insertTextNode
			req.body.content
			req.body.posx
			req.body.posy
			req.body.parent
		*/
		return $http.post('/api/insertTextNode', textNodeData);
	};

	mapFactory.removeTextNode = function(textNodeData){
		return $http.post('/api/removeTextNode', textNodeData);
	};
	
	mapFactory.updateTextNode = function(textNodeData){
		return $http.post('/api/updateTextNode', textNodeData);
	};

	mapFactory.allTextNodesOf = function(parentData){
		//req.body.parentId
		return $http.post('/api/allSubTextNodesOf', parentData);
	};

	mapFactory.getAllMap = function(mindMapData){
		return $http.post('/api/getAllMap', mindMapData);
	}

	mapFactory.searchMap = function(data){
		return $http.post('/api/searchMap', data);
	}



	return mapFactory;


})


.factory('socketio', function($rootScope){

	var socket =  io.connect();

	return{
		on: function(eventName, callback){
			socket.on(eventName, function(){
				var args = arguments;
				$rootScope.$apply(function(){
					callback.apply(socket, args);
				});
			});
		},

		emit: function(eventName, data, callback){
			socket.emit(eventName, data, function(){
				var args = arguments;
				$rootScope.apply(function(){
					if(callback){
						callback.apply(socket,args);
					}
				});
			});
		}

	};

});