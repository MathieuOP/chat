const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

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
        socket.broadcast.emit('userConnected', socket.pseudo);
    });

    socket.on('message', (message) => {
        console.log(message);
        socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', () => {
        const userDisconnected = `${socket.pseudo} is disconnected`;
        socket.broadcast.emit('userDisconnected', userDisconnected);
    });
})

server.listen(3000, () => console.log('Port écouté: 3000'));