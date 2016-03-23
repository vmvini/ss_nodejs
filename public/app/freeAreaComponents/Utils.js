//UTILITARIOS

Array.prototype.last = function() {
    return this[this.length-1];
};

function addSubstringAtPosition(subs, sourcestr, position){
	var output = sourcestr.substr(0, position) + subs + sourcestr.substr(position);
	return output;
}

function normalizeString(string){
	//substituir todos ' ' repetidos por um só ' '
	string = string.replace(/\s\s+/g, ' ');

	if(string.charCodeAt(0) == 160 || string.charCodeAt(0) == 32 ){
		string = string.slice(1);
	}

	if(string.charCodeAt(string.length - 1) == 160 || string.charCodeAt(string.length - 1) == 32){
		string = string.slice(0, string.length - 1);
	}


	return string;
}

function removeHtmlExceptSpan(string){
	var newstring = string.replace(/\<(?!span).*?\>/g, "");
	var newstring2 = newstring.replace(/&nbsp;/gi,"");
	return newstring2;
}

function removeAllHtml(string){
	var newstring = string.replace(/(&nbsp;|<([^>]+)>)/ig, "");
	return newstring;
}