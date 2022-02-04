var express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

/* Socket.IO docs

socket.emit('message', "this is a test"); //sending to sender-client only

socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender

socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender

socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)

socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid

io.emit('message', "this is a test"); //sending to all clients, include sender

io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender

io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender

socket.emit(); //send to all connected clients

socket.broadcast.emit(); //send to all connected clients except the one that sent the message

socket.on(); //event listener, can be called on client to execute on server

io.sockets.socket(); //for emiting to specific clients

io.sockets.emit(); //send to all connected clients (same as socket.emit)

io.sockets.on() ; //initial connection from a client.

*/
var roundCall = Boolean(0);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  //Reply to their connection by fetching their socket.id
  socket.emit('joined');

  socket.on('chat message', msg => {
    console.log("received chat");
    io.emit('chat message', msg);
  });

  socket.on('movement', msg => {
    io.emit('movement', msg);
  });
  
  socket.on('playerjoin', msg => {
    // Broadcast new player to all current players
    socket.broadcast.emit('playerjoinedReply',msg);
  });

  socket.on('sendPlayer', msg => {
    io.to(msg[0]).emit('playerjoined',[msg[1],msg[2],msg[3]]);
  });

  socket.on('bomb', async msg => {
    // Authority- determine bomb status, stars status for this round.
    // The first socket who calls this gets their numbers in.
    if(!roundCall) {
      roundCall = Boolean(1);
      io.emit('bomb',msg);
      
      console.log("Called round!");
      
      await new Promise(r => setTimeout(() => roundCall = Boolean(0), 2000));
    }

  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
    io.emit('disconnected', socket.id);
  });

});

app.use('/assets', express.static(__dirname + '/assets'));

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
