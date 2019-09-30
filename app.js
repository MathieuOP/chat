const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

const User = require('./models/User');
const Message = require('./models/Message');

const session = require("express-session")({
    secret: "chat socket.io",
    resave: true,
    saveUninitialized: true
});
const sharedsession = require("express-socket.io-session");

mongoose.connect('mongodb://localhost/chat', {useNewUrlParser: true,  useUnifiedTopology: true });

app.use(express.static('public'))

.use(bodyParser.urlencoded({ extended: false }))

.use(session)

.set('view engine', 'ejs')

.get('/', (req, res) => {

    res.setHeader('Content-Type', 'text/html');
    res.status('200').render(__dirname + '/public/index.ejs');
})


.get('/chat', (req, res, next) => {

    User.find({}, (err, users) => {
        if (!err) {
            res.setHeader('Content-Type', 'text/html');
            res.status('200').render(__dirname + '/public/chat.ejs', { users: users });
        }
    });
})

.post('/', (req, res, next) => {
    req.session.pseudo = req.body.pseudo;

    User.create({name: req.body.pseudo}, (err, data) => {
        if (!err) {
            res.setHeader('Content-Type', 'text/html');
            res.redirect('/chat');
        }
    });
})


.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
})
 
io.use(sharedsession(session))

io.sockets.on('connection', (socket) => {

    const pseudo = socket.handshake.session.pseudo
    const numberUsersConnected = io.engine.clientsCount;

    io.emit('lastUserConnected', { pseudo, numberUsersConnected});
    socket.broadcast.emit('addUserInListUserConnected', { pseudo });

    socket.on('message', (message) => {
        Message.create({sender: pseudo, message}, (err, data) => {
            if (!err) {
                socket.broadcast.emit('message', { message, pseudo });
            }
        });
    });

    socket.on('disconnect', () => {

        const numberUsersConnected = io.engine.clientsCount;
        const userDisconnected = `Last user disconnected: ${pseudo}`;

        User.findOneAndDelete({name: pseudo}, (err, user) => {
            if (!err) {
                socket.broadcast.emit('userDisconnected', { userDisconnected, numberUsersConnected, currentUser: pseudo });
            }
        })
    });
})

server.listen(3000, () => console.log('Port écouté: 3000'));