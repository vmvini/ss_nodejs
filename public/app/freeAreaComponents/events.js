//status de um evento.
var NAO_REGISTRADO = 0;
var REGISTRADO = 1;

//Target : objeto que representa um elemento do DOM ou do Stage
function Target(name, element){
	this.name = name;
	this.element = element;
}

//MyEvent : objeto que representa um event listener
//name : nome relativo ao evento
//target : objeto que escuta evento
//eventType : tipo do evento
//command : função a ser chamada 
//execute() : instala o event handler ao event listener
//pause() : cancela o event listener
function MyEvent(name, target, eventType, command){
	this.target = target;
	this.eventType = eventType;
	this.command = command;
	this.name = name;

	this.execute = function(){};

	this.pause = function(){};

	this.setNewCommand = function(command){
		this.pause(); //pausando antigo comando
		this.command = command; //setando novo comando
		this.execute();
	};

	this.eventListenerStatus = NAO_REGISTRADO;

}

//StageEvent : objeto que representa event listener para elemento Stage do EaselJS
function StageEvent(name, target, eventType, command){
	MyEvent.call(this, name, target, eventType, command);
	
	this.execute = function(){
		if(this.eventListenerStatus == NAO_REGISTRADO){
			target.addEventListener(this.eventType, this.command);
			this.eventListenerStatus = REGISTRADO;
		}
	};
	this.pause = function(){
		if(this.eventListenerStatus == REGISTRADO){
			target.removeEventListener(this.eventType);
			this.eventListenerStatus = NAO_REGISTRADO;
		}
	};

}
StageEvent.prototype = new MyEvent();
StageEvent.prototype.constructor = StageEvent;


//DOMEvent : objeto que representa event listener para um elemento DOM
function DOMEvent(name, target, eventType, command){
	MyEvent.call(this, name, target, eventType, command);

	this.execute = function(){
		if(this.eventListenerStatus == NAO_REGISTRADO){
			this.target.addEventListener(this.eventType, this.command, false);
			this.eventListenerStatus = REGISTRADO;
		}
	};

	this.pause = function(){
		if(this.eventListenerStatus == REGISTRADO){
			this.target.removeEventListener(this.eventType, this.command, false);

			this.eventListenerStatus = NAO_REGISTRADO;
		}
	};
}
DOMEvent.prototype = new MyEvent();
DOMEvent.prototype.constructor = DOMEvent;



//EventListenerManagement : objeto responsavel por localizar, remover, criar e manter event handlers
function EventListenerManager(){
	this.listeners = []; //lista de objetos do tipo MyEvent

	//adiciona event listener
	this.addListener = function(listener){
		listener.execute();
		this.listeners.push(listener);
	}

	//desabilita todos os event listeners de tipo eventType
	this.disableEventsListenerOfType = function(eventType){
		var i;
		for(i in this.listeners){
			if( this.listeners[i].eventType == eventType ){
				this.listeners[i].pause();
			}
		}
	};

	//habilita um evento pelo seu nome
	this.enableEventByName = function(name){
		
		var obj = this.getEventListenerByName(name);
		if(obj)
			obj.execute();
	}


	//habilita todos os event listeners de tipo eventType
	this.enableEventsListenerOfType = function(eventType){
		var i;
		for(i in this.listeners){
			if(this.listeners[i].eventType == eventType){
				this.listeners[i].execute();

			}
		}
	};

	//remove um event listener pelo seu nome
	this.removeEventListenerByName = function(name){
		var i;
		var saveIndex;
		for(i in this.listeners){
			if(this.listeners[i].name == name){
				this.listeners[i].pause();
				saveIndex = i;
			}
		}
		this.listeners.splice(saveIndex, 1); //reorganizando array. eliminando buracos.
	};

	//coloca um outro metodo para ser disparado quando o listener ouvir evento.
	this.changeEventHandler = function(name, command){
		var myEvent = this.getEventListenerByName(name);
		myEvent.setNewCommand(command);
	}

	//recupera um MyEvent pelo nome
	this.getEventListenerByName = function(name){
		var i;
		for(i in this.listeners){
			if(this.listeners[i].name == name)
				return this.listeners[i];
		}
		return null;
	}

}