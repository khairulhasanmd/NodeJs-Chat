const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

var user_id_temp = 0;

var server_port = 4000;
// var ip_addresses = [];
//for getting ip address
var users = [];
var rooms = [];

// var os = require('os');
// var interfaces = os.networkInterfaces();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')));

app.get('/', function(request, response){
        var appData = {
                // 'server_ip_address': ip_addresses[0],
                'server_port': server_port
        }
        response.render('index.ejs', {appData: appData});
})

function getRoomUsers(chat_room) {
        return users.filter(user => user.chat_room === chat_room);
}


io.sockets.on('connection', function(socket){

        socket.on('join_room', ( user ) => {
                // if(!rooms.includes(room)){
                //         rooms.push(room);
                // }
                // console.log(user.chat_room);
                user.socket_id = socket.id;
                socket.join(user.chat_room);
                          
                // Broadcast when a user connects
                // socket.broadcast
                //   .to(user.chat_room)
                //   .emit(
                //     'message',
                //     formatMessage(botName, `${user.username} has joined the chat`)
                //   );
            
                // Send users and room info
                io.to(user.chat_room).emit('roomUsers', {
                  room: user.chat_room,
                  users: getRoomUsers(user.chat_room)
                });
              });
              
              socket.on('join_all_known_rooms', ( user ) => {
                user.chat_rooms.forEach(function(this_room){
                        // user_id_temp = user.id;
                        // // rooms[this_room] = [];
                        // rooms[this_room][user.id] = user;
                        // console.log(rooms);
                        // I was not successful on manipulating chat rooms and peoples
                        socket.join(this_room);//join this user to the room
                });
              });

        socket.on('user_online', function(user){
                socket.user = user;
                // io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');
                io.emit('is_online', socket.user);
                user.socket_id = socket.id;
                // users[user.id] = user;
                if(!users.includes(user)){
                        users.push(user);
                }
                io.emit('user_list', users);
                // console.log(users);
        })
        socket.on('disconnect', function(user){
                // io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
                io.emit('is_offline', socket.user);
                //remove the user from the user list
                
                console.log(socket.id);
                const index = users.filter(obj => {
                        return obj.socket_id === socket.id;
                });
                if (index > -1) {
                  users.splice(index, 1);
                }
                io.emit('user_list', users);
        })
        socket.on('writingOn', function(user){
                // io.emit('writingOn', '🔴 <i>' + socket.username + ' is typing a message..</i>');
                io.to(user.chat_room).emit('writingOn', socket.user);
        })
        socket.on('writingOff', function(user){
                // io.emit('writingOff', '🔴 <i>' + socket.username + ' stopped typng..</i>');
                io.to(user.chat_room).emit('writingOff', socket.user);
        })
        socket.on('chat_message', function(message){
                io.to(message.user.chat_room).emit('chat_message', message);
                //send message to commonroom
                // io.to('commonroom').emit('commonroom_message', message);
                // console.log(message);
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
