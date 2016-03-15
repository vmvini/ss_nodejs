angular.module('easel', [])

.factory('StageService', function(){

	var stageFactory = {};

	var stage = new createjs.Stage("myCanvas");

	stageFactory.stage = stage;


	stageFactory.addText = function(text, x, y){

		var text = new createjs.Text(text, "48px Arial", "#000");
		text.x = x;
		text.y = y;
		this.stage.addChild(text);
		this.stage.update();

	};

	return stageFactory;

});