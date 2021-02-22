const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
// const mysql = require('mysql');
// const db_connection = mysql.createConnection({
// 	host: 'localhost',
// 	user: 'root',
// 	password: 'bismillah',
// 	database: 'chat'
// })

// db_connection.connect((err)=>{
// 	if (err) {
// 		console.log("Error connecting with DB");
// 		return;
// 	};
// 	console.log('DB connected!');
// })



var server_port = 3000;
var ip_addresses = [];
//for getting ip address
var users = [];
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
		// io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');
		io.emit('is_online', socket.username);
		if(!users.includes(username)){
			users.push(username);
		}
		// db_connection.query('SELECT * FROM chat_log ', (err,rows) => {
		// 	if(err) throw err;
		// 	socket.emit('chat_log', rows);
		// });
		io.emit('user_list', users);
	})
	socket.on('disconnect', function(username){
		// io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
		io.emit('is_offline', socket.username);
		//remove the user from the user list
		const index = users.indexOf(username);
		if (index > -1) {
		  users.splice(index, 1);
		}
		io.emit('user_list', users);
	})
	socket.on('writingOn', function(username){
		// io.emit('writingOn', '🔴 <i>' + socket.username + ' is typing a message..</i>');
		io.emit('writingOn', socket.username);
	})
	socket.on('writingOff', function(username){
		// io.emit('writingOff', '🔴 <i>' + socket.username + ' stopped typng..</i>');
		io.emit('writingOff', socket.username);
	})
	socket.on('chat_message', function(message){
		io.emit('chat_message', {
			'username': socket.username,
			'message': message
		});
		var log = {
			username: socket.username,
			message: message
		}
		// db_connection.query('INSERT INTO chat_log SET ?', log, (err, res) => {
		// 	if(err) throw err;  
		// 	console.log('Last insert ID:', res.insertId);
		// });
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



/* cheat sheet

// sending to sender-client only
socket.emit('message', "this is a test");

// sending to all clients, include sender
io.emit('message', "this is a test");

// sending to all clients except sender
socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
io.in('game').emit('message', 'cool game');

// sending to sender client, only if they are in 'game' room(channel)
socket.to('game').emit('message', 'enjoy the game');

// sending to all clients in namespace 'myNamespace', include sender
io.of('myNamespace').emit('message', 'gg');

// sending to individual socketid
socket.broadcast.to(socketid).emit('message', 'for your eyes only');

// list socketid
for (var socketid in io.sockets.sockets) {}
 OR
Object.keys(io.sockets.sockets).forEach((socketid) => {});
*/