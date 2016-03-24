
//Objeto que representa um frame que contem elementos desenhados no stage. frame é o nivel de zoom
//RECOMENDO RENOMEAR PARA StageTextFrame
function StageFrame(stage2, parentFrame, stringtext, font, color){
	createjs.Text.call(this, stringtext, font, color);

	this.stage2 = stage2;

	this.frameObjects = []; //objetos do tipo StageFrame

	this.parentFrame = parentFrame;

	this.stageTransform;

	
	this.addChildFrame = function(stageFrame){
		
		this.frameObjects.push(stageFrame);

	}


	this.drawFrame = function(){
		
		this.stage2.addChild(this);
		this.stage2.update();
		
	};

	this.drawChilds = function(){
		this.stage2.removeAllChildren();
		this.stage2.update();
		for(var i = 0; i < this.frameObjects.length; i++){
			this.frameObjects[i].drawFrame();
			
		}
	};

	this.drawLastInserted = function(){
		this.frameObjects.last().drawFrame();
	};

	this.drawParent = function(){
		this.stage2.removeAllChildren();
		this.parentFrame.drawFrame();
	};

	this.saveFrameState = function(){
		this.stageTransform = this.stage2.getMatrix().decompose();
	};


	this.restoreFrameState = function(){
		//stage.setTransform( [x=0]  [y=0]  [scaleX=1]  [scaleY=1]  [rotation=0]  [skewX=0]  [skewY=0]  [regX=0]  [regY=0] )
		var x = this.stageTransform.x;
		var y = this.stageTransform.y;
		var scaleX = this.stageTransform.scaleX;
		var scaleY = this.stageTransform.scaleY;
		var skewX = this.stageTransform.skewX;
		var skewY = this.stageTransform.skewY;
		var rot = this.stageTransform.rotation;
		this.stage2.setTransform(x, y, scaleX, scaleY, rot, skewX, skewY );
	};

}

StageFrame.prototype = new createjs.Text();
StageFrame.prototype.constructor = StageFrame;



//objeto que representa uma marcação de texto stage frame
function StageFrameMark(stage2, parentFrame){
	createjs.Shape.call(this);

	this.stage2 = stage2;

	this.frameObjects = []; //objetos do tipo StageFrame

	this.parentFrame = parentFrame;

	this.stageTransform;

	



	this.addChildFrame = function(stageFrame){
		
		this.frameObjects.push(stageFrame);

	}


	this.drawFrame = function(){
		
		this.stage2.addChild(this);
		this.stage2.update();
		
	};

	this.drawChilds = function(){
		this.stage2.removeAllChildren();
		this.stage2.update();
		for(var i = 0; i < this.frameObjects.length; i++){
			this.frameObjects[i].drawFrame();
			
		}
	};

	this.drawLastInserted = function(){
		this.frameObjects.last().drawFrame();
	};

	this.drawParent = function(){
		this.stage2.removeAllChildren();
		this.parentFrame.drawFrame();
	};

	this.saveFrameState = function(){
		this.stageTransform = this.stage2.getMatrix().decompose();
	};


	this.restoreFrameState = function(){
		//stage.setTransform( [x=0]  [y=0]  [scaleX=1]  [scaleY=1]  [rotation=0]  [skewX=0]  [skewY=0]  [regX=0]  [regY=0] )
		var x = this.stageTransform.x;
		var y = this.stageTransform.y;
		var scaleX = this.stageTransform.scaleX;
		var scaleY = this.stageTransform.scaleY;
		var skewX = this.stageTransform.skewX;
		var skewY = this.stageTransform.skewY;
		var rot = this.stageTransform.rotation;
		this.stage2.setTransform(x, y, scaleX, scaleY, rot, skewX, skewY );
	};




}

StageFrameMark.prototype = new createjs.Shape();
StageFrameMark.prototype.constructor = StageFrameMark;