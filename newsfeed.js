var ioreq = require('socket.io'),
	http = require('http'),
	fs = require('fs');

var server = http.createServer(function(req, resp) {
	fs.readFile(__dirname + '/index.htm', function(err, data) {
		if(err) {
			resp.writeHead(500);
			resp.end('An error occurred!');
		} else {
			resp.writeHead(200);
			resp.end(data);
		}
	});
});

var follow = require('follow');
var io = ioreq.listen(server);
io.sockets.on('connection', function (socket) {
	follow("http://localhost:5984/motech-event-logging", function(error, change) {
	  if(!error) {
	    console.log("Got change number " + change.seq + ": " + change.id);
		var getDocClient = http.createClient(5984, 'localhost');
		var docReq = getDocClient.request('/motech-event-logging/' + change.id);
		docReq.end();
		docReq.on('response', function(docResp) {
			docResp.setEncoding('ascii');
			docResp.on('data', function (doc) {
				socket.emit('update', doc);		
			});
		});
	  } else {
		console.log('error occurred');
	}
	})
});

server.listen(9000);
console.log('listening on 9000');
