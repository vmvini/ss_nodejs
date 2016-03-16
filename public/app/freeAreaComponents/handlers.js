function InsertTextBehavior(insertTextDiv, listenerManager){
	this.insertTextDiv = insertTextDiv;
	this.listenerManager = listenerManager;

	this.applyTo = function(stageElement){
		this.listenerManager.addListener(new StageEvent(
			"mouseOutTextEnableInsertText",
			stageElement,
			"mouseout",
			this.insertTextDiv.createDblClickCanvasHandler()
			));

		this.listenerManager.addListener(new StageEvent(
			"mouseOverTextDisableInsertText",
			stageElement,
			"mouseover",
			this.insertTextDiv.removeDblClickCanvasHandler()
			));
		
	};
}




//Objeto que abstrai as operações de zoom
function ZoomBehavior(canvas, stageManager, listenerManager){
	this.canvas = canvas;
	this.stageManager = stageManager;
	this.listenerManager = listenerManager;

	this.lastMouseOverFrame;

	//Método que aplica comportamento de zoom em mouseover texto e remove em mouseout texto
	this.applyTo = function(stageElement){ //stageElement é um objeto da stage. ex: text
		listenerManager.addListener(new StageEvent(
			"mouseOverText",
			stageElement,
			"mouseover",
			this.textMouseInEnableZoom() 
			));


		listenerManager.addListener(new StageEvent(
			"mouseOutText",
			stageElement,
			"mouseout",
			this.textMouseOutDisableZoom()

			));

	};

	this.makeZoomHandler = function(){
		var stage = this.stageManager.stage;
		var that = this;
		return function(e){
			if(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))>0){
				zoom=1.1;

			}
			else{
				zoom=1/1.1;

			}
			var local = stage.globalToLocal(stage.mouseX, stage.mouseY);
			stage.regX=local.x;
			stage.regY=local.y;
			stage.x=stage.mouseX;
			stage.y=stage.mouseY;	
			stage.scaleX=stage.scaleY*=zoom;
			stage.update();
			that.lastMouseOverFrame = stage.getObjectUnderPoint(local.x, local.y, 0); 
			
			that.stageManager.zoomLimitsBehavior(that.lastMouseOverFrame);
			
		}
	}

	this.textMouseInEnableZoom = function(){
		var that = this;
		var listenerManager = this.listenerManager;
		var canvas = this.canvas;
		return function(e){
			that.lastMouseOverFrame = e.target; //sinalizando o elemento stage no qual o mouse esta em cima
			var zoomEvent1 = new DOMEvent("zoomEvent", canvas, "DOMMouseScroll", that.makeZoomHandler()  );
			var zoomEvent2 = new DOMEvent("zoomEvent2", canvas, "mousewheel", that.makeZoomHandler() );
			listenerManager.addListener(zoomEvent1);
			listenerManager.addListener(zoomEvent2);
		};
	}
	

	this.textMouseOutDisableZoom = function(){
		var listenerManager = this.listenerManager;
		return function(){
			listenerManager.removeEventListenerByName("zoomEvent");
			listenerManager.removeEventListenerByName("zoomEvent2");
		};
	}



}





//objeto que abstrai div e suas operaçoes
function Div(){ //recebe um array de domObjects no construtor
	//o array de domObjects representa a div mae e seus itens internos, sendo o primeiro elemento a div mae
	
	this.show = function(domObject, stage){
		var that = this;
		return function(){
			domObject.style.top = stage.mouseY + "px";
			domObject.style.left = stage.mouseX + "px";

			domObject.style.display = "inline-block";
			that.lastDivX = stage.mouseX;
			that.lastDivY = stage.mouseY;
		};	

	};

	this.lastDivX = undefined;
	this.lastDivY = undefined;

	this.hide = function(domObject){
		domObject.style.display = "none";
	};

	this.cleanTextValue = function(domObject){
		domObject.innerHTML = "";
	};


}

//objeto que represeta a div que insere texto
function InsertTextDiv(textDiv, contentDiv, enterButton, stageManager, listenerManager){
	//quando a div é criada, deve se criar o event listener respectivo
	this.textDiv = document.getElementById(textDiv);
	this.contentDiv = document.getElementById(contentDiv);
	this.enterButton = document.getElementById(enterButton);
	this.stageManager = stageManager;
	this.listenerManager = listenerManager;
	//aqui eh a ligação da div ao evento
	
	//Esse metodo cria e ativa o evento de clicar no botao Enter para inserir novo texto
	this.createEnterTextHandler = function(){
		var insertTextEvent = new DOMEvent("insertTextClick", this.enterButton, "click", this.getInsertTextHandler() );
		this.listenerManager.addListener(insertTextEvent);
	};

	//Esse metodo cria e ativa o evento de clicar no canvas para exibir div de inserção de texto
	this.createDblClickCanvasHandler = function(){
		var that = this;
		return function(){
			var dblClickEvent = new DOMEvent("dblClickFreeArea", that.stageManager.canvasProps.canvas, "dblclick", that.show(that.textDiv, that.stageManager.stage ) );
			that.listenerManager.addListener(dblClickEvent);
		};

	};

	this.removeDblClickCanvasHandler = function(){
		var that = this;
		return function(){
			that.listenerManager.removeEventListenerByName("dblClickFreeArea");
		};
	};
	


	//Esse metodo retorna o handler que trata da inserção de texto
	this.getInsertTextHandler = function(){
		var that = this;
		return function(){
			var text = that.contentDiv.textContent;
			var point = stageManager.translateMouseCoordinates(stageManager.stage, that.lastDivX, that.lastDivY);
			that.stageManager.addText(text, point.x, point.y);
			that.hide(that.textDiv);
			that.cleanTextValue(that.contentDiv);
		};
	};


}
InsertTextDiv.prototype = new Div();
InsertTextDiv.prototype.constructor = InsertTextDiv;

