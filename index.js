const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

var server_port = 4000;
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
        socket.on('user_online', function(user){
                socket.user = user;
                // io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');
                io.emit('is_online', socket.user);
                if(!users.includes(user)){
                        users.push(user);
                }
                io.emit('user_list', users);
        })
        socket.on('disconnect', function(user){
                // io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
                io.emit('is_offline', socket.user);
                //remove the user from the user list
                
				const index = users.filter(obj => {
					return obj.email === user.email;
				});
                if (index > -1) {
                  users.splice(index, 1);
                }
                io.emit('user_list', users);
        })
        socket.on('writingOn', function(user){
                // io.emit('writingOn', '🔴 <i>' + socket.username + ' is typing a message..</i>');
                io.emit('writingOn', socket.user);
        })
        socket.on('writingOff', function(user){
                // io.emit('writingOff', '🔴 <i>' + socket.username + ' stopped typng..</i>');
                io.emit('writingOff', socket.user);
        })
        socket.on('chat_message', function(message){
                message.user = socket.user;
                io.emit('chat_message', message);
        })
})

const server = http.listen(4000, "0.0.0.0")



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
