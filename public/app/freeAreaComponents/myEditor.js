
  function MyEditor(stageManager, canvas, listenerManager){

    this.stageManager = stageManager;
    this.canvas = canvas;
    this.listenerManager = listenerManager;

    this.lastInsertTextPos = {};

    this.createDblClickCanvasHandler = function(){
      var that = this;
      return function(){
        var dblClickEvent = new DOMEvent("dblClickFreeArea", that.canvas, "dblclick", that.showEditorToInsertText() );
        that.listenerManager.addListener(dblClickEvent);
      };

    };


    this.removeDblClickCanvasHandler = function(){
      var that = this;
      return function(){
        that.listenerManager.removeEventListenerByName("dblClickFreeArea");
      };
    };

    this.createTextClickHandler = function(){
        var that = this;
        return function(e){
          var textStageFrame = e.target;
          var text = '';

          if(textStageFrame.htmltext)
              text = textStageFrame.htmltext;
          else 
              text = textStageFrame.text;

          //colocando texto selecionado no editor
          $('#froala-editor').froalaEditor('html.set', text);

          $('#froala-editor').css('display', 'inline-block');

          
          $('#froala-editor').css('top', that.stageManager.stage.mouseY);
          $('#froala-editor').css('left',that.stageManager.stage.mouseX);

  
          that.configEnterTextButton(  that.createEnterTextHandler( textStageFrame )  );          
          

        };
    };

    this.showEditorToInsertText = function(){
      var that = this;
      return function(e){

       $('#froala-editor').css('display', 'inline-block');
       $('#froala-editor').css('top', e.clientY);
       $('#froala-editor').css('left', e.clientX);

       that.lastInsertTextPos = that.stageManager.translateMouseCoordinates(that.stageManager.stage, e.clientX, e.clientY); 
     };


    };

    this.configAddTextMarkButton = function(){
        $.FroalaEditor.DefineIcon('insert', {NAME: 'plus'});
        $.FroalaEditor.RegisterCommand('insert', {
          title: 'Insert Mark',
          focus: true,
          undo: true,
          refreshAfterCallback: true,
          callback: function () {
          //this.html.insert('My New HTML');
          //texto selecionado : this.selection.text()
          this.colors.background("#FFFF00");
        }
      });
    };


    this.configRemoveTextMarkButton = function(){
       $.FroalaEditor.DefineIcon('remove', {NAME:'minus'});
       $.FroalaEditor.RegisterCommand('remove', {
        title: 'Remove Mark',
        focus:true,
        undo:true,
        refreshAfterCallback:true,
        callback:function(){
          this.commands.clearFormatting();
        }

      });

    };

    var that = this;
    this.createEnterTextHandler = function(textToUpdate){
          
        return function(){
            var spanObjects = [];
            var spans = $("p").find("span");
            //setando atributos de identificaçao em cada span
            for(var k=0; k< spans.length; k++ ){
             $(spans[k]).attr("i", k);
           }

           var html = $('#froala-editor').froalaEditor('html.get', false);

           var text = normalizeString( removeAllHtml( html ) );

          var textWithSpans = normalizeString( removeHtmlExceptSpan(html) );
           
           var marked = [];
           for(var i = 0; i < spans.length; i++){

            marked[i] = normalizeString( spans[i].textContent );
            var onlySpanTag = "<span style=\"background-color: rgb(255, 255, 0);\" i=\""+i+"\">";
            var startIndex = textWithSpans.indexOf(onlySpanTag);
            var endIndex = startIndex + marked[i].length;
                //remover span tag anterior
                textWithSpans =  textWithSpans.replace(onlySpanTag, '');

                var spanObj = {
                 content:marked[i],
                 startIndex:startIndex,
                 endIndex:endIndex,
                 key:i,
                 onlySpanTag: onlySpanTag
               };
               spanObjects.push(spanObj);
             }


            /*console.log("palavras chave: ");
            for(var k = 0; k < spanObjects.length; k++){
              console.log(text.substring(spanObjects[k].startIndex, spanObjects[k].endIndex));
            }*/

            if(textToUpdate){
               //that.stageManager.updateText(textToUpdate, text, spanObjects);

               textToUpdate = null;
            }
            else
              that.stageManager.addText(text, that.lastInsertTextPos.x, that.lastInsertTextPos.y, spanObjects, html );
            

            $('#froala-editor').css('display', 'none');
       
        }  

    }



    this.configEnterTextButton = function(callback){
       $.FroalaEditor.DefineIcon('getHtml', {NAME: 'info'});
       var that = this;
       $.FroalaEditor.RegisterCommand('getHtml', {
        title: 'Get HTML',
        focus: true,
        undo: true,
        refreshAfterCallback:true,
        callback: callback
      });

    };



    this.initialize = function(){
        this.configAddTextMarkButton();
        this.configRemoveTextMarkButton();
        this.configEnterTextButton( this.createEnterTextHandler() );
        this.createDblClickCanvasHandler()();


        $('div#froala-editor').froalaEditor({
        // Add the custom buttons in the toolbarButtons list, after the separator.
        toolbarButtons: ['insert', 'getHtml', 'remove'],
        toolbarButtonsMD: ['insert', 'getHtml', 'remove'],
        toolbarButtonsSM: ['insert', 'getHtml', 'remove'],
        toolbarButtonsXS: ['insert', 'getHtml', 'remove']
      });

    };

  }

  function MyEditorTextBehavior(myEditor, listenerManager){
    this.myEditor = myEditor;
    this.listenerManager = listenerManager;

    this.applyTo = function(stageElement){
      this.listenerManager.addListener(new StageEvent(
          "mouseOutTextEnableInsertText",
          stageElement,
          "mouseout",
          this.myEditor.createDblClickCanvasHandler()
        ));
      this.listenerManager.addListener(new StageEvent(
          "mouseOverTextDisableInsertText",
          stageElement,
          "mouseover",
          this.myEditor.removeDblClickCanvasHandler()
        ));

      this.listenerManager.addListener(new StageEvent(
          "mouseClickOpenEditorToUpdate",
          stageElement,
          "click",
          this.myEditor.createTextClickHandler()
        ));
    };
  
  }
