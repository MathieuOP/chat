const express = require('express');
const app = express();

app.use(express.static('public'))

.set('view engine', 'ejs')

.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status('200').render(__dirname + '/public/index.ejs', { text: 'Chat created with node.js, socket.io, express and mongoDB'});
})

.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
})


.listen(3000, () => {
    console.log('Port écouté: 3000');
});