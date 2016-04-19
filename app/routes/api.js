//requisitando arquivo config.js que possui constantes de conexao, porta, banco...
var config = require('../../config');

//recuperando secretKey do objeto config
var secretKey = config.secretKey;

//requisitando o modulo jsonwebtoken para criação de tokens de autenticação
var jsonwebtoken = require('jsonwebtoken');


//função para criação de token 
//parametro: user -> usuario recuperado do banco de dados
function createToken(user){
	var token = jsonwebtoken.sign({
		id: user._id,
		name: user.name,
		email: user.email,
		image: 	user.image
	}, secretKey, { expirtesInMinute: 1440 }); //o token é codificado com base na chave secreta q esta no objeto config

	return token;
}



module.exports = function(app, express, io, db, fs){

	//pegando o objeto router do expressjs.
	//Router abstrai as requisições http
	var api = express.Router();

	//CADASTRO DE USUARIO
	api.post('/registerUser', function(req, res){
		db.insertNode(
			{
				name: req.body.nome,
				password: req.body.senha1,
				email: req.body.email, 
				image: req.body.image

			}, 
			'User', 
			function(err, result){
				if(err)
					res.send(err.message);
				else
					res.json({success:"sucesso ao cadastrar"});
			}

		);
	});

	//LOGIN DE USUARIO
	api.post('/login', function(req, res){
		var cypher = "MATCH (user:User{email:'"+req.body.email+"', password:'"+req.body.password+"'}) RETURN user;";
		

		db.cypherQuery(cypher, function(err, result){
			if(err){
				res.send(err.message);
			}
			else{
				console.log(result.data);
				//res.json(result.data);
				if(result.data){
					//usuario encontrado
					var token = createToken(result.data);
					res.json({
						success:true,
						message:"Seja bem vindo!",
						token: token
					});
				}
				else{
					//usuario nao encontrado
					res.send({success:false, message: "Email ou senha incorretos!"});
				}
			}

		});
	});




	//TUDO ANTES DESSE MIDDLEWARE NÃO PRECISA ESTAR AUTENTICADO
	//criando middleware que cuida de verificar se a cada requisiçao, existe um token de autenticaçao
	//pra criar o efeito de sessão
	//esse middleware é colocado aqui propositadamente, pois o token é gerado depois de uma requisição post
	api.use(function(req, res, next){

		console.log("somebody just came to our app!");

		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		//verificar se token existe
		if(token){
			jsonwebtoken.verify(token, secretKey, function(err, decoded){
				if(err){
					res.status(403).send({success:false, message:"Failed to authenticate user"});
				} else {
					//passou na validação
					//decoded ficara os dados decodificados do token, no caso`user id, name, username
					req.decoded = decoded;
					//ir para proxima rota
					next();
				}
			});
		} else{
			//token nao existe
			res.status(403).send({success:false, message:"No token provided"});
		}

	}); 

	//TUDO DEPOIS DESSE MIDDLEWARE PRECISA ESTAR AUTENTICADO



	api.get('/me', function(req, res){
		res.json(req.decoded);
	});



	api.post('/addImage', function(req, res){

		db.insertNode(
			{
				path: req.body.path,
				x: req.body.x,
				y: req.body.y
			},
			'IMG',
			function(err, result){
				if(err)
					res.send(err.message);
				else{
					db.insertRelationship(req.body.parentId, result._id, 'HAS', {}, function(Rerr, Rresult){
						if(Rerr)
							res.send(Rerr.message);
						else
							res.json(result);
					});
				}	
			}

		);

	});

	api.post('/getImages', function(req, res){
		db.cypherQuery("MATCH (t)-[r:HAS]->(img:IMG) WHERE id(t)="+ req.body.parentId +" RETURN img", function(err, result){
			if(err){
				res.send(err.message);
			}
			else
				res.json(result.data);
		});
	});

	api.post('/removeImage', function(req, res){

		var finalPath = "/home/vmvini/Dropbox/ADS_QUINTO_PERIODO/tcc/SS_nodejs/public" + req.body.path;
		console.log("removendo ");
		console.log(finalPath);
		fs.remove(finalPath, function(err){
			if(err)
				console.log("erro ao remover imagem: " + err);
			else{

				db.cypherQuery("MATCH (img:IMG {path:'"+req.body.path+"'}) DETACH DELETE img", function(err, result){
					if(err){
						res.send(err.message);
					}
					else
						res.json(result.data);
				});
				console.log("sucesso ao remover imagem");
			}

		});

		
	});


	//criar rota para inserir mapa mental:
	api.post('/insertMindMap', function(req, res){

		db.insertNode(
		{
			name: req.body.name,
			creator: req.body.creator,
			description:req.body.description
			//tags:req.body.tags

		}, 'Map', function(err, result){
				if(err)
					res.send(err.message);
				else{

					io.emit('new_map', result );
					res.json(result);
				}
			});

	});

	//pegar todos os mapas
	api.get('/getAllMaps', function(req, res){

		db.cypherQuery("MATCH (map:Map) RETURN map", function(err, result){
			if(err){
				res.send(err.message);
			}
			else
				res.json(result.data);
		});


	});


	//criar rota para inserir nó em mapa mental
	api.post('/insertTextNode', function(req, res){

		db.insertNode({

			content: req.body.content,
			posx: req.body.posx,
			posy: req.body.posy,
			html: req.body.html

		}, 'TextNode', function(err, result){
			if(err)
				res.send(err.message);
			else{
				db.insertRelationship(req.body.parent, result._id, 'HAS', {}, function(Rerr, Rresult){
					if(Rerr)
						res.send(Rerr.message);
					else
						res.json(result);
				});
			}
		});

	});

	//remover text node
	api.post('/removeTextNode', function(req, res){
		var textId = req.body.textId;
		//MATCH (mortm)-[]->(t:TextNode)-[]->(tm:TextMark) WHERE id(t)=197 DETACH DELETE t;
		db.cypherQuery("MATCH (t:TextNode)-[]-() WHERE id(t)="+textId+" DETACH DELETE t;", function(err, result){
			if(err){
				res.json({success:false, message:err.message});
			}
			else
				res.json({success:true});
		});
	});

	//atualizar texto node
	api.post('/updateTextNode', function(req, res){

		db.updateNode(req.body.textId,  //retorna true ou false operação update
			{
				posx: req.body.posx,
				posy: req.body.posy,
				html: req.body.html,
				content:req.body.content

			}, function(uerr, node){
				if(uerr){
					res.send(uerr.message);
				}
				else
					res.json(node);
		});

	});



	//criar rota para recuperar todos os nós de nivel 0 do mapa
	api.post('/allFirstLevelNodes', function(req, res){

		db.cypherQuery("MATCH (map:Map)-[]->(textNode:TextNode) WHERE id(map)="+req.body.mapId+"  RETURN textNode", function(err, result){
			if(err){
				res.send(err.message);
			}
			else
				res.json(result.data);
		});

	});



	//criar rota para recuperar todos os sub nós de um nó 
	api.post('/allSubTextNodesOf', function(req, res){

		db.cypherQuery("MATCH (p:TextMark)-[]->(t:TextNode) WHERE id(p)="+req.body.parentId+" RETURN t", function(err, result){
			if(err){
				res.send(err.message);
			}
			else
				res.json(result.data);
		});

	});


	//recuperar todas as texts marks de um texto
	api.post('/allTextMarks', function(req, res){

		db.cypherQuery("MATCH (t:TextNode)-[]->(m:TextMark) WHERE id(t)=" + req.body.textId + " RETURN m", 
			function(err, result){
				if(err)
					res.send(err.message);
				else
					res.json(result.data);
			});

	});

	//persistir uma text mark de um texto
	api.post('/persistTextMark', function(req, res){

		db.insertNode(
			{
				content:req.body.mark.content,
				startIndex: req.body.mark.startIndex,
				endIndex: req.body.mark.endIndex,
				key: req.body.mark.key,
				onlySpanTag: req.body.mark.onlySpanTag
			},
			
			'TextMark',

			function(err, result){
				if(err)
					res.send(err.message);
				else{
					
					db.updateNode(result._id,  //retorna true ou false operação update
						{
							dbId: result._id,
							content:result.content,
							startIndex: result.startIndex,
							endIndex: result.endIndex,
							key: result.key,
							onlySpanTag: result.onlySpanTag

					 	}, function(uerr, node){
						if(uerr){
							console.log("ERRO AO ADICIONAR PROPERTY dbId ao textMark");
							res.send(uerr.message);
						}
						else{
							db.insertRelationship( req.body.textId, result._id, 'MARK', {}, function(Rerr, Rresult){
								if(Rerr)
									res.send(Rerr.message);
								else{
									result.dbId = result._id;
									
									res.json(result);
								}
							} );
						}

					});

				}
			}

		);
	});

	/*
	relateMarks = function(data){
		//data = ({ parentId: stageFactory.currentFrame.markId, newMarkId: resp._id } )
	*/

	api.post('/relateMarks', function(req, res){
		db.insertRelationship( req.body.parentId, req.body.newMarkId, 'NEXT', {}, function(Rerr, Rresult){
			if(Rerr)
				res.send(Rerr.message);
			else{
				
				res.json(Rresult);
			}
		} );
	});



	//atualizar textmark
	api.post('/updateTextMark', function(req, res){
		db.updateNode(req.body.oldMark.dbId,  //retorna true ou false operação update
		{
			dbId: req.body.oldMark.dbId,
			content:req.body.newMark.content,
			startIndex: req.body.newMark.startIndex,
			endIndex: req.body.newMark.endIndex,
			key: req.body.newMark.key,
			onlySpanTag: req.body.newMark.onlySpanTag

		}, function(uerr, node){
			if(uerr){
				res.send(uerr.message);
			}
			else
				res.json(node);
		});
	});


	//apagar relacionamento entre um textmark e um textnode
	api.post('/detachTextMarkFromTextNode', function(req, res){
		var cypher = "MATCH (t:TextNode)-[r:MARK]->(tm:TextMark) WHERE id(t)="+req.body.textNodeId+" AND id(tm)="+req.body.textMarkId+" DELETE r";

		db.cypherQuery(cypher, 
			function(err, result){
				if(err)
					res.send(err.message);
				else
					res.json(result.data);
			});

	});
/*
	api.post('/getAllMap', function(req, res){
		//MATCH (m:Map {name:"teste 3"})-[]->(t)-[*]->(tm)  RETURN m, t, tm;
		var cypher = "MATCH path = (m:Map)-[]->(t)-[*]->(tm) WHERE id(m)="+req.body.mapId+" RETURN path;";

		db.cypherQuery(cypher, 
			function(err, result){
				if(err)
					res.send(err.message);
				else
					res.json(result);
			});

	});*/


	api.post('/getAllMap', function(req, res){

		/*
		 statement: 'MATCH path = (m:Map)-[]->(t)-[*]->(tm) WHERE id(m)='+req.body.mapId+' RETURN path;',

		 MATCH path = (m:Map)-[:NEXT*]->(mark:TextMark) WHERE id(m)='+req.body.mapId+' RETURN path;
		*/
		 var statementsOne = {
            statements: [{
                statement: 'MATCH path = (m:Map)-[:NEXT*]->(mark:TextMark) WHERE id(m)='+req.body.mapId+' RETURN path;',
                resultDataContents:["graph"]
            }]
        };

		db.beginTransaction(statementsOne, function (err, result) {
                    if(err)
						res.send(err.message);
					else
						res.json(result);
                });

	});




	return api;
}