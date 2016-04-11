module.exports = function(app, express, io, db){

	//pegando o objeto router do expressjs.
	//Router abstrai as requisições http
	var api = express.Router();

	
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
		*/
		 var statementsOne = {
            statements: [{
                statement: 'MATCH path = (m:Map)-[]->(t) WHERE id(m)='+req.body.mapId+' RETURN path;',
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