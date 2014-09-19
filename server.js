var http = require('http'),
	people = require('./data'),
	db = require('./db'),
	app = require('./app')(people),
	server = http.createServer(app),
	io = require('socket.io').listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.on('connection', function (socket) {
    socket.on('message', function (msg) {
        socket.broadcast.emit('message', msg);
    });
});

	