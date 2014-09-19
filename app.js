/**
 * Module dependencies.
 */
 	var http = require('http');
 	var locations = require('./data');
 	var db = require('./db');
	var express = require('express');
	var routes = require('./routes')();
	var path = require('path');	
	var app = express(),
	server = http.createServer(app),
	io = require('socket.io').listen(server);
	var locationSchema = require('./schemas/location');
	// sets it on localhost 3000
	app.set('port', process.env.PORT || 5000);
	
	//app.use(express.static(__dirname + '/public'));
	// sets up jade directory
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	 app.use(function (req, res, next) {
		req.db = db;
		next();
	});
	app.use(app.router);
	
	// links to js, html, css frontend

	app.use(express.static(path.join(__dirname, 'public')));

	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}

	app.get('/', function (req, res) {
	  	res.render('index',
	  	{ title : 'Protest Map' }
	  	);
	});
	app.get('/'), function(req, res){
		res.render('/test',
			{title: 'test'});
	}
	
	server.listen(app.get('port'), function(){
  		console.log('Express server listening on port_' + app.get('port'));
	});
	//

	// starts when socket emits a connection
	io.on('connection', function (socket) {

		//gives each session a unique id, DOUBLE CHECK
		socket.emit('sessionIds', {id:socket.id});
		// that unique id is then sent back to the frontend
	  	socket.on('id', function  (id) {
	  	});
	  //main.js calls right afer decalring socket.io
	  // call back
	  // initial geoJson
	  socket.on('GetCoords', function (){
	  	routes.getGeoJsonFromMongo( function (geoJsonFromMongo) {
	  		socket.emit('dataSending', geoJsonFromMongo);
	  	});
	  	
	  })

	  //updtes the geojson
	  socket.on('GetCoordsAll', function (){
	  	routes.getGeoJsonFromMongo( function (geoJsonFromMongo) {
	  		socket.emit('dataSendingTypeAll', geoJsonFromMongo);
	  	});
	  	
	  })

	  // quires by type 
	    socket.on('queryType', function (type){
	  	routes.typeQueryJson( type , function (callback) {
	  		socket.emit('queryReturned', callback);
	  		
	  	});
	  	
	  })

	   // quires by date
	    socket.on('queryDate', function (timeStart, timeEnd){
	  		routes.dateQueryJson( timeStart, timeEnd, function ( callback) {
	  			socket.emit('queryReturnedDate', callback);
	  	});
	  	
	  })

	  //when a user sends a protest in
	  socket.on('locationSend', function (coords){
	  	routes.locationSent(coords);

	  	io.sockets.emit('newDataFromSocketsComming');

	  })

	 
 });


