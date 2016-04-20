
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
         //PARA RESOLVER O PROBLEMA DE CLICAR NUMA MARCAÇÃO DE TEXTO, EU TENHO QUE 
            //PEGAR O TARGET CORRETO. QUE É O StageFrame e nao o StageFrameMark
          
           var textStageFrame;
          if(e.target instanceof StageFrame)
            textStageFrame = e.target;
          else 
            textStageFrame = e.target.referredTextFrame;


          var text = '';

          if(textStageFrame.htmltext)
              text = textStageFrame.htmltext;
          else 
              text = textStageFrame.text;

         
          //colocando texto selecionado no editor
           $('#froala-editor').css('display', 'inline-block');
           //ANTES PRECISO APAGAR QUE JA TEM NO EDITOR
          $('#froala-editor').froalaEditor('html.set', '<p>Digite o texto aqui.</p>');
          $('#froala-editor').froalaEditor('commands.selectAll');
          $('#froala-editor').froalaEditor('html.insert', text, true);

          $('#froala-editor').css('top', that.stageManager.stage.mouseY);
          $('#froala-editor').css('left',that.stageManager.stage.mouseX);

  
          that.configEnterTextButton(  that.createEnterTextHandler( textStageFrame )  );          
          

        };
    };

    this.showEditorToInsertText = function(){
      var that = this;
      return function(e){

       $('#froala-editor').css('display', 'inline-block');
       $('#froala-editor').css('top', that.stageManager.stage.mouseY);
       $('#froala-editor').css('left', that.stageManager.stage.mouseX);

        //resetando conteudo 
        $('#froala-editor').froalaEditor('html.set', '<p>Digite o texto aqui.</p>');
        $('#froala-editor').froalaEditor('commands.selectAll');
        $('#froala-editor').froalaEditor('html.insert', "<p>Digite seu texto aqui</p>", true);

       that.lastInsertTextPos = that.stageManager.translateMouseCoordinates(that.stageManager.stage, that.stageManager.stage.mouseX, that.stageManager.stage.mouseY); 
     };


    };

    this.configAddTextMarkButton = function(){
      $.FroalaEditor.DefineIconTemplate('addMark', '<i class="fa fa-pencil-square" style="color:yellow; background-color:black;"></i>'); 
        $.FroalaEditor.DefineIcon('insert', {NAME: 'plus', template:'addMark'});
        $.FroalaEditor.RegisterCommand('insert', {
          title: 'Realçar',
          focus: true,
          undo: true,
          refreshAfterCallback: true,
          callback: function () {
          //this.html.insert('My New HTML');
          //texto selecionado : this.selection.text()
          //this.commands.clearFormatting();
          //$('#froala-editor').froalaEditor('commands.clearFormatting');
          this.colors.background("#FFFF00");
         
         
          }
      });
    };


    this.configRemoveTextMarkButton = function(){
      //<i class="fa fa-pencil-square"></i>

       $.FroalaEditor.DefineIconTemplate('removeMark', '<i class="fa fa-pencil-square" style="color:grey;"></i>'); 
       $.FroalaEditor.DefineIcon('remove', {NAME:'minus', template:'removeMark'});
       $.FroalaEditor.RegisterCommand('remove', {
        title: 'remover realce',
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
            //REMOVENDO O QUE ESTA CAUSANDO BUG DE INSERÇAO DE MARCAÇAO DE TEXTO
            $( "span" ).remove( ".fr-placeholder" );

            var spanObjects = [];
            //removendo spans com estilo invalido
            $('#froala-editor span:not([style])').replaceWith(function () {
                    return $(this).text();
            });

            var spans =  $('#froala-editor span[style]'); //$("#froala-editor").find("span");
            //setando atributos de identificaçao em cada span
            for(var k=0; k< spans.length; k++ ){
             $(spans[k]).attr("i", k);

             console.log("setando attr em span: " + k);
             console.log(spans[k]);
            
           }
           

           var html = $('#froala-editor').froalaEditor('html.get', false);
           
          



          var text = normalizeString( removeAllHtml( html ) );

          var textWithSpans = normalizeString( removeHtmlExceptSpan(html) );
           
           var marked = [];
           for(var i = 0; i < spans.length; i++){

            marked[i] = normalizeString( spans[i].textContent );
            var onlySpanTag = "<span style=\"background-color: rgb(255, 255, 0);\" i=\""+i+"\">";
            var startIndex = textWithSpans.indexOf(onlySpanTag);
            //if(startIndex == -1)
                //startIndex = textWithSpans.indexOf("<span i=\""+i+"\">");
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
                //stageFrameText, newcontent, newhtmlContent, newmarks
               that.stageManager.updateText(textToUpdate, text, html, spanObjects);

               textToUpdate = null;
            }
            else
                that.stageManager.addText(text, that.lastInsertTextPos.x, that.lastInsertTextPos.y, spanObjects, html );
            
            $('#froala-editor').css('display', 'none');
            $("#froala-editor").find("span").remove();
            
            
       
        }  

    }



    this.configEnterTextButton = function(callback){
       $.FroalaEditor.DefineIconTemplate('enterButton', '<i class="fa fa-play"></i>'); 
       $.FroalaEditor.DefineIcon('enterText', {NAME: 'enterText', template:'enterButton'});
       var that = this;
       $.FroalaEditor.RegisterCommand('enterText', {
        title: 'Inserir Texto',
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


        $('#froala-editor').froalaEditor({
        // Add the custom buttons in the toolbarButtons list, after the separator.
        toolbarButtons: ['enterText', 'insert', 'remove'],
        toolbarButtonsMD:  ['enterText', 'insert', 'remove'],
        toolbarButtonsSM:  ['enterText', 'insert', 'remove'],
        toolbarButtonsXS: ['enterText', 'insert', 'remove'],
        htmlDoNotWrapTags: ['script', 'style', 'img'],
        htmlAllowedTags: [],
        multiLine: false,
        theme:'dark'
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
