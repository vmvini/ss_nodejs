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


.factory('StageManagerService', function(CanvasProps, MapService, TextMarksService){

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
		stageFactory.originFrame.id = mapkey;
		stageFactory.originFrame.markId = mapkey;
	}

	//salva texto no banco de dados
	function persistText(text, x, y, parent, html, callback){
		var textNodeData = { 
			content : text,
			posx: x,
			posy: y,
			parent: parent,
			html:html
		};

		MapService.insertTextNode(textNodeData)
		.success(function(data){
			callback(data);
		});
	
	}

	//recupera textos do banco de dados
	function fetchTextNodes(parentId, callback){
		
		MapService.allTextNodesOf( { parentId:parentId } )
		.success(function(data){
			callback(data);

		});

	}

	stageFactory.getCharWidth = function(string){
		var word = new StageFrame(null, null, string, "48px Arial", "#000");
		return word.getBounds().width;
	};

	/*
	stageFactory.generateHtmlText = function(textElement, mark){
		textElement.htmltext = addSubstringAtPosition(mark.onlySpanTag, textElement.htmltext, mark.startIndex + textElement.updateLength );
		textElement.updateLength += mark.onlySpanTag.length;
		textElement.htmltext = addSubstringAtPosition("</span>", textElement.htmltext,  mark.endIndex + textElement.updateLength);
		textElement.updateLength += "</span>".length;

	};
	*/
	stageFactory.getMarkRectangule = function(textElement, MarkStartIndexPosition, mark){

		

		var i = mark.startIndex;

		var lines = MarkStartIndexPosition.lines;
		var qtdLines = lines.length;
		var currentLine = MarkStartIndexPosition.line;
		var currentCharAtLine = MarkStartIndexPosition.charIndex;

		var lineHeight = MarkStartIndexPosition.lineHeight;

		var posx = MarkStartIndexPosition.posX;
		var posy = MarkStartIndexPosition.posY;

		var width = 0;

		var rects = [];

		var currentChar = '';

		while( ( i < mark.endIndex )  && ( currentLine < qtdLines )  ){

			currentChar = charAt( lines[currentLine], currentCharAtLine++ );
			width += stageFactory.getCharWidth( currentChar );
			i++;

			if ( currentCharAtLine == lines[currentLine].length ){

				rects.push({
					x:posx,
					y:posy,
					width:width
				});


				if( ++currentLine < qtdLines )
					posy += lineHeight;


				currentCharAtLine = 0;
				posx = textElement.x;
				width = 0;



			}

		}
		rects.push({
			x:posx, 
			y:posy,
			width:width
		});

		return rects;


	};

	stageFactory.getMarkStartIndexPosition = function(textElement, startIndex){
		var metrics = textElement.getMetrics();
		var lines = metrics.lines;
		insertSpaceEveryLine(lines);

		var qtdLines = lines.length;
		var currentLine = 0;
		var currentCharAtLine = 0;

		var traversedX = textElement.x;
		var traversedY = textElement.y;

		var i = 0;
		while( ( i < startIndex )  && ( currentLine < qtdLines )  ){


			currentChar = charAt( lines[currentLine], currentCharAtLine++ );
			traversedX += stageFactory.getCharWidth( currentChar );
			i++;

			if ( currentCharAtLine == lines[currentLine].length ){

				if( ++currentLine < qtdLines )
					traversedY += metrics.lineHeight;

				currentCharAtLine = 0;
				traversedX = textElement.x;

			}


		}

		return {
			posX : traversedX,
			posY : traversedY,
			line: currentLine,
			lines:lines,
			charIndex: currentCharAtLine,
			lineHeight:metrics.lineHeight
		};
	};




	stageFactory.drawRectangule = function(x, y, width, lineHeight){
		var rect = new StageFrameMark( stageFactory.stage, stageFactory.currentFrame );
		rect.graphics.beginFill("#FFFF00").drawRect(x, y, width, lineHeight);
		rect.alpha = 0.5;

		stageFactory.currentFrame.addChildFrame(rect);
		stageFactory.currentFrame.drawLastInserted();

		return rect;
	};

	stageFactory.drawMark = function(textElement, mark){
		console.log("desenhando marcacao");
		var drawnRect;
		if(!textElement.textmarks)
			textElement.textmarks = [];

		var coordinates = stageFactory.getMarkStartIndexPosition(textElement, mark.startIndex);

			var rects = stageFactory.getMarkRectangule(textElement, coordinates, mark);

			for(var r = 0; r < rects.length; r++){
				drawnRect = stageFactory.drawRectangule(rects[r].x, rects[r].y, rects[r].width, coordinates.lineHeight );
				drawnRect.markId = mark.dbId;

				for(var i = 0; i < stageFactory.behaviors.length; i++){
					stageFactory.behaviors[i].applyTo(drawnRect);
				}

				textElement.textmarks.push(drawnRect);
			}

	};

	stageFactory.drawMarks = function(textElement, marks){
		var drawnRect;
		if(!textElement.textmarks)
			textElement.textmarks = [];

		for(var m = 0; m < marks.length; m++ ){
			var coordinates = stageFactory.getMarkStartIndexPosition(textElement, marks[m].startIndex);

			var rects = stageFactory.getMarkRectangule(textElement, coordinates, marks[m]);

			for(var r = 0; r < rects.length; r++){
				drawnRect = stageFactory.drawRectangule(rects[r].x, rects[r].y, rects[r].width, coordinates.lineHeight );
				
				textElement.textmarks.push(drawnRect);
			}
			
		}
	};

	function persistMark(mark, textId, callback){

		TextMarksService.persist( { mark:mark, textId:textId } )
				.success(function(data){
					callback(data);
				});		
	}



	stageFactory.addText = function(text, x, y, marks, html, notpersist){
		var label1 = new StageFrame(stageFactory.stage, stageFactory.currentFrame, text, "48px Arial", "#000");	
		label1.x = x;
		label1.y = y;
		
		label1.alpha = 1;
		label1.lineWidth = 1000;

		var hit = new createjs.Shape();

		hit.graphics.beginFill("#000").drawRect(0, 0, label1.getBounds().width + 10, label1.getMeasuredHeight() + 10);
		label1.hitArea = hit;

		for(var i = 0; i < stageFactory.behaviors.length; i++){
			stageFactory.behaviors[i].applyTo(label1);
		}

		label1.htmltext = html;

		stageFactory.currentFrame.addChildFrame(label1);
		stageFactory.currentFrame.drawLastInserted();
				

		if(notpersist == undefined){ //deve persistir
			
			persistText(text, x, y, stageFactory.currentFrame.markId, html, function(data){
				label1.id = data._id;
				
				linkTextMark();

				
			});
		}
		else{ //nao deve persistir
			label1.id = notpersist.id;
			linkTextMark();
		}

		

		function linkTextMark(){
			if(marks){
				marks.forEach(function(mark){

					if(!mark.dbId){
					//essa mark nao foi salva no banco ainda
					persistMark(mark, label1.id, function(data){

						mark.dbId = data.dbId;
						stageFactory.drawMark(label1, mark);
					} );
				}
				else{
					//essa mark veio do banco de dados
					stageFactory.drawMark(label1, mark);
				}

			});

			}
			
		}

		

		
		

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
			
			if( lastMouseOverFrame instanceof StageFrameMark ){

				stageFactory.currentFrame = lastMouseOverFrame;
				stageFactory.currentFrame.saveFrameState();
				stageFactory.setInitialScale();
				//ler os filhos de currentFrame no banco de dados... se nao tiver nenhum localmente
				if(stageFactory.currentFrame.frameObjects.length == 0){

					stageFactory.stage.removeAllChildren();
					stageFactory.stage.update();

					fetchTextNodes(stageFactory.currentFrame.markId, function(data){
						data.forEach(function(each){
							
							TextMarksService.allTextMarks( { textId: each._id } )
							.success(function(marks){
								stageFactory.addText(each.content, each.posx, each.posy, marks, each.html, { id:each._id });
							});
							
						});
					});
					
				}
				else //se ja tiver textos carregados localmente. simplesmente desenha-los
					stageFactory.currentFrame.drawChilds();

				//retirar zoom
				var event;
				event = document.createEvent("HTMLEvents");
	    		event.initEvent("mouseout", true, true);
	   			event.eventName = "mouseout";
	   			stageFactory.currentFrame.dispatchEvent(event);

			}


			
		
		}
		else if(stageFactory.stage.scaleX <= CanvasProps.min_zoom){
			if(!stageFactory.currentFrame.parentFrame){
				//se o pai do current frame for null, significa que esta no quadro inicial
				stageFactory.isRootFrameAndMinZoom = true;
			}
			else{
				
				stageFactory.currentFrame.restoreFrameState();
				stageFactory.currentFrame = stageFactory.currentFrame.parentFrame;
				stageFactory.currentFrame.drawChilds();
				
			}
		}

		else //se nao esta nos limites de zoom, entao permitir zoom livremente.
			stageFactory.isRootFrameAndMinZoom = false;
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

.factory('StageConfigurator', function(StageManagerService, CanvasProps){

	var configurator = {};

	

	configurator.config = function(mapId){

		StageManagerService.setMap(mapId);	
		
		StageManagerService.stage.enableMouseOver();
		StageManagerService.enableDragCanvas();

		var zoomBehavior = new ZoomBehavior(StageManagerService.canvasProps.canvas, StageManagerService, StageManagerService.listenerManager);
		StageManagerService.behaviors.push(zoomBehavior);

		var myEditor = new MyEditor(StageManagerService, CanvasProps.canvas, StageManagerService.listenerManager  );
		myEditor.initialize();

		var editorTextBehavior = new MyEditorTextBehavior(myEditor, StageManagerService.listenerManager);

		StageManagerService.behaviors.push(editorTextBehavior);


	};


	 return configurator;


});