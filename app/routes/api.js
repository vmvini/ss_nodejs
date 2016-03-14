module.exports = function(app, express, io, db){

	//pegando o objeto router do expressjs.
	//Router abstrai as requisições http
	var api = express.Router();

	api.get('/allMovies', function(req, res){

		db.cypherQuery("MATCH (movie:Movie) RETURN movie", function(err, result){
			if(err){
				res.send("mensagem de erro"+err.message);
			}
			else
				res.json(result.data);
		});

	});


	return api;
}