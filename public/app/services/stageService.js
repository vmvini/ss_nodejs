angular.module('easel', [])


.factory('CanvasProps', function(){

	var canvasProps = {};

	canvasProps.id = "myCanvas";
	canvasProps.width = window.innerWidth;
	canvasProps.height = window.innerHeight;
	canvasProps.max_zoom = 7;
	canvasProps.min_zoom = 0.1;
	canvasProps.canvas = document.getElementById(canvasProps.id);
	canvasProps.canvas.width = canvasProps.width;
	canvasProps.canvas.height = canvasProps.height;

	return canvasProps;

})


.factory('StageManagerService', function(CanvasProps, MapService){

	var stageFactory = {};

	stageFactory.canvasProps = CanvasProps;
	
	stageFactory.stage = new createjs.Stage(CanvasProps.id);

	stageFactory.listenerManager = new EventListenerManager();

	stageFactory.behaviors = [];

	stageFactory.currentFrame = new StageFrame(stageFactory.stage); //primeiro frame é vazio

	stageFactory.originFrame = stageFactory.currentFrame;
	
	var mapkey = '';

	stageFactory.setMap = function(mapId){
		mapkey = mapId;
	}


	function persistFirstLevelText(text, x, y, callback){
		var textNodeData = { 
			content : text,
			posx: x,
			posy: y,
			parent: mapkey
		};

		MapService.insertFirstLevelTextNode(textNodeData)
			.success(function(data){
				callback(data);
			});
	}


	stageFactory.addText = function(text, x, y, notpersist){
		var label1 = new StageFrame(stageFactory.stage, stageFactory.currentFrame, text, "48px Arial", "#000");
		label1.x = x;
		label1.y = y;
		console.log("posx: " + x + " posy: " + y);
		label1.alpha = 1;
		label1.lineWidth = 1000;

		var hit = new createjs.Shape();

		hit.graphics.beginFill("#000").drawRect(0, 0, label1.getBounds().width + 10, label1.getMeasuredHeight() + 10);
		label1.hitArea = hit;

		for(var i = 0; i < stageFactory.behaviors.length; i++){
			stageFactory.behaviors[i].applyTo(label1);
		}
		
		if(notpersist == undefined){ //deve persistir
			persistFirstLevelText(text, x, y, function(data){
				label1.id = data._id;
				console.log("id do texto inserido: " + data._id);
			});
		}

		stageFactory.currentFrame.addChildFrame(label1);
		stageFactory.currentFrame.drawLastInserted();
		

	};

	stageFactory.setInitialScale = function(){
		stageFactory.stage.scaleX = 0.1;
		stageFactory.stage.scaleY = 0.1;
	};

	stageFactory.setEndScale = function(){
		stageFactory.stage.scaleX = 6.8;
		stageFactory.stage.scaleY = 6.8;
	};

	stageFactory.zoomLimitsBehavior = function(lastMouseOverFrame){
		
		if(stageFactory.stage.scaleX >= CanvasProps.max_zoom){
			
			stageFactory.currentFrame = lastMouseOverFrame;
			stageFactory.currentFrame.saveFrameState();
			stageFactory.setInitialScale();

			//this.stage.setTransform(point.x, point.y);
			
			stageFactory.currentFrame.drawChilds();

			//retirar zoom
			var event;
			event = document.createEvent("HTMLEvents");
    		event.initEvent("mouseout", true, true);
   			event.eventName = "mouseout";
   			stageFactory.currentFrame.dispatchEvent(event);
		
		}
		else if(stageFactory.stage.scaleX <= CanvasProps.min_zoom){
			if(!stageFactory.currentFrame.parentFrame){
				//se o pai do current frame for null, significa que esta no quadro inicial
				stageFactory.setInitialScale();
				stageFactory.stage.setTransform(0,0);
			}
			else{
				
				stageFactory.currentFrame.restoreFrameState();
				stageFactory.currentFrame = stageFactory.currentFrame.parentFrame;
				stageFactory.currentFrame.drawChilds();
				
			}
		}
	};


	stageFactory.translateMouseCoordinates = function(displayObject, x, y){
		return displayObject.globalToLocal(x, y);
	};

	stageFactory.enableDragCanvas = function(){
		var that = stageFactory;
		stageFactory.stage.addEventListener("stagemousedown", function(e) {
			var subThat = that;
			var offset={x:that.stage.x-e.stageX,y:that.stage.y-e.stageY};
			that.stage.addEventListener("stagemousemove",function(ev) {

				subThat.stage.x = ev.stageX+offset.x;
				subThat.stage.y = ev.stageY+offset.y;
				subThat.stage.update();
			});
			subThat.stage.addEventListener("stagemouseup", function(){

				subThat.stage.removeAllEventListeners("stagemousemove");
			});
		});
	};


	return stageFactory;

})

.factory('StageConfigurator', function(StageManagerService){

	var configurator = {};

	

	configurator.config = function(mapId){

		StageManagerService.setMap(mapId);	
		
		StageManagerService.stage.enableMouseOver();
		StageManagerService.enableDragCanvas();

		var insertTextDiv = new InsertTextDiv("textInput","text", "enterButton", StageManagerService, StageManagerService.listenerManager);
		var dblClickHandler = insertTextDiv.createDblClickCanvasHandler();
		dblClickHandler();
		insertTextDiv.createEnterTextHandler();

		//criando behaviors a serem usados pelo stageManager
		var insertTextBehavior = new InsertTextBehavior(insertTextDiv, StageManagerService.listenerManager);
		var zoomBehavior = new ZoomBehavior(StageManagerService.canvasProps.canvas, StageManagerService, StageManagerService.listenerManager);
		StageManagerService.behaviors.push(insertTextBehavior);
		StageManagerService.behaviors.push(zoomBehavior);

	};


	 return configurator;


});