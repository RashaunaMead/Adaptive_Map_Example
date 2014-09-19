module.exports = function (server){
	var io = require('socket.io').listen(server);
	var PersonSchema  = require('../schemas/person');
	// var io = require('socket.io').listen(server);
	// server.listen(app.get('port'));

	io.on('connection', function (socket) {
		console.log("HERE");

	  socket.on('id', function  (id) {
	    //io.sockets.emit('chat', {message: '# ' + data.message});
	    routes.checkInHappendFE(id);
	    //console.log(routes.checkIns2());

	    io.sockets.emit('updateReady',  "SENDING NEW UPDATE TO ALL SERVERS");
	    io.sockets.emit('updatePerson', checkIns2());


	    // var newPersonObject = {};

	    // newPersonObject = peopleSchema.exec;
	    // //app.put(3, routes.checkInHappendFE);


	  });




	   socket.on('refresh', function  () {
	   		io.socket
	    	app.get('/checkIns', routes.checkIns);
	  });

		 io.sockets.emit('message', "this is a test");
	    socket.on('message', function (msg) {
	    	socket.broadcast.emit('news', { hello: 'world' });

	        socket.broadcast.emit('message', msg);

	    });
	});


	 function checkIns2(){
				console.log("CALLED INSIDE JOB ");
				var newCheckIn = [];
				PersonSchema.find()
				//noSQL sort
				//sort by name or other
				.setOptions({sort: 'checkIn'})
				.exec(function(err, checkIn){
					
					//newCheckIn = checkIn;

					for( var property in checkIn){
						var newObj = {};
						//console.log(property + checkIn[property]);
						newObj = checkIn[property];
						newCheckIn.push(newObj);
						//console.log(newCheckIn);

					}
					//console.log(newCheckIn);
					
				}); 
				//console.log(newCheckIn);

				//var newCheckIn = [{number: 32, id:3},{number: 32, id: 3}];
				return(newCheckIn);

			};
};