var express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/part10.html');
});

io.on('connection', (socket) => {
  //Reply to their connection by fetching their socket.id
  io.emit('joined');

  socket.on('chat message', msg => {
    console.log("received chat");
    io.emit('chat message', msg);
  });

  socket.on('movement', msg => {
    io.emit('movement', msg);
  });
  
  socket.on('join', msg => {
    console.log(msg);
  });
});

app.use('/assets', express.static(__dirname + '/assets'));

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
