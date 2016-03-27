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




	stageFactory.drawRectangule = function(originRect , x, y, width, lineHeight){
		var rect = new StageFrameMark( originRect, stageFactory.stage, stageFactory.currentFrame );
		rect.graphics.beginFill("#FFFF00").drawRect(x, y, width, lineHeight);
		rect.alpha = 0.5;

		stageFactory.currentFrame.addChildFrame(rect);
		stageFactory.currentFrame.drawLastInserted();

		return rect;
	};

	stageFactory.drawMark = function(textElement, mark){
		
		var drawnRect;
		if(!textElement.textmarks)
			textElement.textmarks = [];

		var coordinates = stageFactory.getMarkStartIndexPosition(textElement, mark.startIndex);

			var rects = stageFactory.getMarkRectangule(textElement, coordinates, mark);


			var firstDrawnRect = stageFactory.drawRectangule(null, rects[0].x, rects[0].y, rects[0].width, coordinates.lineHeight );
				firstDrawnRect.markId = mark.dbId;
				firstDrawnRect.referredTextFrame = textElement;
			for(var i = 0; i < stageFactory.behaviors.length; i++){
				stageFactory.behaviors[i].applyTo(firstDrawnRect);
			}
			textElement.textmarks.push(firstDrawnRect);

			for(var r = 1; r < rects.length; r++){
				drawnRect = stageFactory.drawRectangule(firstDrawnRect, rects[r].x, rects[r].y, rects[r].width, coordinates.lineHeight );
				drawnRect.markId = mark.dbId;
				drawnRect.referredTextFrame = textElement;
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


	
	function removeTextMarksFrames(marks){
		if(marks){
			for(var i = 0; i < marks.length; i++){
				stageFactory.stage.removeChild(marks[i]);

				var pos = stageFactory.currentFrame.frameObjects.indexOf(marks[i]);
				if(pos !== -1){
					stageFactory.currentFrame.frameObjects.splice(pos, 1);
				}

			}
			stageFactory.stage.update();	
		}
	}

	function removeTextFrame(textNode){

		removeTextMarksFrames(textNode.textmarks);
		//removendo texto do stage
		stageFactory.stage.removeChild(textNode);

		//removendo texto do currentFrame
		var pos = stageFactory.currentFrame.frameObjects.indexOf(textNode);
		if(pos !== -1){
			stageFactory.currentFrame.frameObjects.splice(pos, 1);
		}

		stageFactory.stage.update();
	}

	stageFactory.updateText = function(stageFrameText, newcontent, newhtmlContent, newmarks){
		
		if(stageFrameText.htmltext == newhtmlContent){
			console.log("nao atualizou nada");
			return;
		}

		if( removeAllSpaces(newcontent) == '' ){
			//eraseTextMarks(stageFrameText.textmarks, createRemoveTextNode(stageFrameText) );
			MapService.removeTextNode( {textId: stageFrameText.id } )
			.success(function(result){
				console.log(result);
				console.log("removido: " + stageFrameText.id);
				removeTextFrame(stageFrameText);
			});
			return;
		}
		
		stageFrameText.htmltext = newhtmlContent;
		stageFrameText.text = newcontent;
		//atualizar tamanho da hit area
		createHitArea(stageFrameText);

		MapService.updateTextNode( 
			{   posx : stageFrameText.x,
				posy : stageFrameText.y,
				html : stageFrameText.htmltext,
				content : stageFrameText.text,
				textId: stageFrameText.id
			} );

		removeTextMarksFrames(stageFrameText.textmarks);

		function getSimilarMarksBetweenOldAndNew(stageFrameText, newMarks, updatesimilar, removeLinkToDifferent){
			var oldContent = '';
			var newContent = '';
			var oldMarks = stageFrameText.marks;
			var equal = false;
			for(var o = 0; o < oldMarks.length; o++){
				equal = false;

				for(var n = 0; n < newMarks.length; n++){

					oldContent = removeAllSpaces(oldMarks[o].content);
					newContent = removeAllSpaces(newMarks[n].content);
					
					if( oldContent == newContent ){
						equal = true;
						newMarks[n].dbId = oldMarks[o].dbId;
						updatesimilar(newMarks[n], oldMarks[o]);

					}
				}
				if(equal == false){
					removeLinkToDifferent(stageFrameText, oldMarks[o]);
				}

			}
			//array de propriedades de marcaçao
			stageFrameText.marks = [];
			//array de marcacoes desenhadas (retangulos) ou stageFrameMark
			stageFrameText.textmarks = [];

		}

		getSimilarMarksBetweenOldAndNew(stageFrameText, newmarks, function(newMark, oldMark){
			TextMarksService.updateTextMark({
				oldMark:oldMark,
				newMark:newMark
			});
		}, 
		function(textNode, oldMark){
			TextMarksService.detachTextMarkFromTextNode({
				textNodeId: textNode.id,
				textMarkId: oldMark.dbId
			});
		} );

		linkTextMark(stageFrameText, newmarks);

		
	};

	function createHitArea(textElement){
		var hit = new createjs.Shape();

		hit.graphics.beginFill("#000").drawRect(0, 0, textElement.getBounds().width + 10, textElement.getMeasuredHeight() + 10);
		textElement.hitArea = hit;
	}


	stageFactory.addText = function(text, x, y, marks, html, notpersist){
		var label1 = new StageFrame(stageFactory.stage, stageFactory.currentFrame, text, "48px Arial", "#000");	
		label1.x = x;
		label1.y = y;
		
		label1.alpha = 1;
		label1.lineWidth = 1000;

		createHitArea(label1);

		for(var i = 0; i < stageFactory.behaviors.length; i++){
			stageFactory.behaviors[i].applyTo(label1);
		}

		label1.htmltext = html;
		label1.marks = [];
		
				

		if(notpersist == undefined){ //deve persistir

			persistText(text, x, y, stageFactory.currentFrame.markId, html, function(data){
				label1.id = data._id;
				stageFactory.currentFrame.addChildFrame(label1);
				stageFactory.currentFrame.drawLastInserted();
				linkTextMark(label1, marks );
			});
		}
		else{ //nao deve persistir
			label1.id = notpersist.id;
			stageFactory.currentFrame.addChildFrame(label1);
			stageFactory.currentFrame.drawLastInserted();
			linkTextMark(label1, marks );
		}

	};

	function linkTextMark(stageFrameText, marks){
		if(marks){
			marks.forEach(function(mark){

				if(!mark.dbId){
					//essa mark nao foi salva no banco ainda
					persistMark(mark, stageFrameText.id, function(data){

						mark.dbId = data.dbId;
						stageFactory.drawMark(stageFrameText, mark);
						stageFrameText.marks.push(mark);
					} );
				}
				else{
					//essa mark veio do banco de dados
					stageFactory.drawMark(stageFrameText, mark);
					stageFrameText.marks.push(mark);
				}

			});

		}

	}


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