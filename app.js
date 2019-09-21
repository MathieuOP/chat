const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
let numberUsersConnected = 0;

app.use(express.static('public'))

.set('view engine', 'ejs')

.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status('200').render(__dirname + '/public/index.ejs');
})

.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
})

io.sockets.on('connection', (socket) => {
    
    socket.on('pseudo', (pseudo) => {
        socket.pseudo = pseudo;
        numberUsersConnected++
        io.emit('lastUserConnected', { pseudo: socket.pseudo, numberUsersConnected});
    });

    socket.on('message', (message) => {
        (message !== '') && socket.broadcast.emit('message', {message, pseudo: socket.pseudo});
    });

    socket.on('disconnect', () => {
        if (socket.pseudo !== undefined) {
            numberUsersConnected--;
            const userDisconnected = `Last user disconnected: ${socket.pseudo}`;
            socket.broadcast.emit('userDisconnected', {userDisconnected, numberUsersConnected});
        }
    });
})

server.listen(3000, () => console.log('Port écouté: 3000'));