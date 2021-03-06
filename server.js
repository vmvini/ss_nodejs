//sudo npm install express body-parser morgan --save
var express = require('express');
var bodyParser = require('body-parser');

var fs = require('fs-extra');  
var path = require('path');  
var busboy = require('connect-busboy');

var morgan = require('morgan');
//npm install node-neo4j --save
var neo4j = require('node-neo4j');

//requisitando meu arquivo/objeto de configuração
var config = require('./config'); //config:nome do arquivo

//instanciando objeto do modulo express
var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var db = '';

try{
	db = new neo4j(config.database);
}
catch(e){
	console.log(e);
}

//adicioando middleware bodyParser ao app
//extended:true => aceitar qualquer valor url para routes (aceitando videos, imagens)
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//middleware morgan para fazer logs de todos os requests no console
app.use(morgan('dev'));

app.use(busboy());


//adicionando middleware que trata todos arquivos estaticos
//isso faz com que dentro dos arquivos estaticos eu nao preciso especificar o caminho citando a pasta /public
//pois eles saberão que qualquer coisa estatica está dentro de /public
app.use(express.static(__dirname + '/public'));




/*
	
	SETAR API DE ROTEAMENTO DE LINKS 

*/
var api = require('./app/routes/api')(app, express, io, db, fs);



//registrando api para uso pelo app. 
//todas as rotas dessa api deverão ser acessadas com /api antes.
//por ex: localhost:3010/api/signup
app.use('/api', api);



app.route('/upload')
    .post(function (req, res, next) {
    	console.log("requisitou  /upload");
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            fstream = fs.createWriteStream(__dirname + '/public' + '/img/' + filename);
            console.log("criou diretorio");
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);              
                //res.redirect('back');           //where to go next
                res.json({filePath:'/img/' + filename});
            });
        });
    });


//registrando funcao anonima ao evento de requisição get em qualquer endereço
app.get('*', function(req, res){
	//enviar arquivo index.html como resposta
	//__dirname é var global com endereço diretorio da aplicaçao
	res.sendFile(__dirname + '/public/app/views/index.html');
	
});


//escutando na porta configurada
http.listen(config.port, function(err){
	if(err){
		console.log(err);
	}
	else{
		console.log("Listening on port " + config.port);
	}
});