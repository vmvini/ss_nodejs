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
				else
					res.json(result);
			});

	});


	//criar rota para inserir nó em mapa mental
	api.post('/insertTextNode', function(req, res){

		db.insertNode({

			content: req.body.content,
			posx: req.body.posx,
			posy: req.body.posy

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




	//criar rota para recuperar todos os nós de nivel 0 do mapa
	api.get('/allFirstLevelNodes', function(req, res){

		db.cypherQuery("MATCH (map:Map {_id:"+req.body.map+"})-[]->(textNode:TextNode) RETURN textNode", function(err, result){
			if(err){
				res.send(err.message);
			}
			else
				res.json(result.data);
		});

	});



	//criar rota para recuperar todos os sub nós de um nó 
	api.get('/allSubNodesOf', function(req, res){

		db.cypherQuery("MATCH (parentNode:TextNode{_id:"+req.body.parent+"})-[]->(textNode:TextNode) RETURN textNode", function(err, result){
			if(err){
				res.send(err.message);
			}
			else
				res.json(result.data);
		});

	});




	return api;
}