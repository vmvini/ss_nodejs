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

function removeAllSpaces(string){
	return string.replace(/\s/g, '');
}

function removeHtmlExceptSpan(string){
	var newstring = string.replace(/\<(?!span).*?\>/g, " ");
	var newstring2 = newstring.replace(/&nbsp;/gi," ");
	return newstring2;
}

function removeAllHtml(string){
	var newstring = string.replace(/(&nbsp;|<([^>]+)>)/ig, " ");
	return newstring;
}


function decode_utf8(s) {
			
  return decodeURIComponent(escape(s));
	
}

function encode_utf8(s) {
  return escape(encodeURIComponent(s));
}

function charAt(string, index){

	return string.charAt(index);

}

function insertSpaceEveryLine(arrayString){
	for(var a = 0; a < arrayString.length; a++){
		arrayString[a] += " ";
	}
}

var denied_tags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'queue', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'style', 'section', 'select', 'small', 'source', 'strike', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'];

var denied_attrs = [];//['accept', 'accept-charset', 'accesskey', 'action', 'align', 'alt', 'async', 'autocomplete', 'autofocus', 'autoplay', 'autosave', 'background', 'bgcolor', 'border', 'charset', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'color', 'cols', 'colspan', 'content', 'contenteditable', 'contextmenu', 'controls', 'coords', 'data', 'data-.*', 'datetime', 'default', 'defer', 'dir', 'dirname', 'disabled', 'download', 'draggable', 'dropzone', 'enctype', 'for', 'form', 'formaction', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv', 'icon', 'id', 'ismap', 'itemprop', 'keytype', 'kind', 'label', 'lang', 'language', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'name', 'novalidate', 'open', 'optimum', 'pattern', 'ping', 'placeholder', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan', 'sandbox', 'scope', 'scoped', 'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step', 'summary', 'spellcheck', 'style', 'tabindex', 'target', 'title', 'type', 'translate', 'usemap', 'value', 'valign', 'width', 'wrap'];


function isAfter(pos, string, after_of){
	
	if( string.indexOf(after_of) + after_of.length == pos   )
		return true;
	return false;
}

function getStringAfterOtherStringOccurrenceOrder(string, substring, after_of) {
	var count = occurrences(string, substring, false);
	if(count == 1)
		return count;
	
	var pos;
	for(var i = 1; i <= count; i++){
		pos = nthIndex(string, substring, i);
		if( isAfter(pos, string, after_of) )
			return i;
	}
	return null;
}

function nthIndex(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}

function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}