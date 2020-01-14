const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

var server_port = 8080;
var ip_addresses = [];
//for getting ip address
var os = require('os');
var interfaces = os.networkInterfaces();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')));

app.get('/', function(request, response){
	var appData = {
		'server_ip_address': ip_addresses[0],
		'server_port': server_port
	}
	response.render('index.ejs', {appData: appData});
})

io.sockets.on('connection', function(socket){
	socket.on('username', function(username){
		socket.username = username;
		io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');
	})
	socket.on('disconnect', function(username){
		io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
	})
	socket.on('writingOn', function(username){
		io.emit('writingOn', '🔴 <i>' + socket.username + ' is typing a message..</i>');
	})
	socket.on('writingOff', function(username){
		io.emit('writingOff', '🔴 <i>' + socket.username + ' stopped typng..</i>');
	})
	socket.on('chat_message', function(message){
		io.emit('chat_message', {
			'username': socket.username,
			'message': '<strong>' + socket.username + '</strong>: ' + message
		});
	})
})

const server = http.listen(8080, function(){
	//on init, prepare the ip address from network interfaces
	Object.keys(interfaces).forEach(function(interfaceName){
		interfaces[interfaceName].forEach(function(interface){
			if('IPv4' !== interface.family || interface.internal !== false){
				return;
			}else{//physical interface
				ip_addresses.push(interface.address);
			}
		})
	});
	ip_addresses.forEach(ip_address => {
		console.log('listening on ' + ip_address + ':' + server_port);
	});
})
