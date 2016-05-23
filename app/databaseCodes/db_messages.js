module.exports = function(){

	const messages = {

		UNIQUE_USER : {
			raw_message: "already exists with label User and property \"email\"",
			resp_obj: {
				friendly_message: "Email indisponível.",
				code: "EMAIL_CONSTRAINT"
			}
		},

		AUTHENTICATION_ERROR :{
			resp_obj:{
				friendly_message: "Nome de usuário ou senha incorreto.",
				code:"AUTHENTICATION_ERROR"
			}
		}

	};
	
	var errorIdentifier = function(err){
		for( var prop in messages ){
			var msg = messages[prop].raw_message;
			if( stringContains(err, msg) )
				return messages[prop].resp_obj;
		}
	}

	function stringContains(str, sub){
		return str.indexOf(sub) > -1;
	}	


	errorIdentifier.getErrorRespObj = function(code){
		for( var prop in messages ){
			var mcode = messages[prop].resp_obj.code;
			if(mcode == code)
				return messages[prop].resp_obj;

		}
		return {error:"code not found"};
	}


	return errorIdentifier;


}