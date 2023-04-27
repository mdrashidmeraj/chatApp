import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Filter from 'bad-words';
import { generateMessage, locationGenerateMessage } from './utils/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);   // upar wali line bhi server create kar rahi hai but ye line socket.io me raw http server pass karne ke liye hai
const port = process.env.PORT || 3000;
const io = new Server(server);

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.emit('message', generateMessage('Welcome!')); // to the current user

    socket.broadcast.emit('message', generateMessage('A new user has joined!')); // to all except the current user

    socket.on('sendMessage', (message, cb) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return cb('Profanity is not allowed!');
        }
        io.emit('message', generateMessage(message));
        cb("Delivered");    // to acknowledge the event
    });

    socket.on('sendLocation', (coords, cb) => {
        console.log(coords);
        io.emit('locationMessage', locationGenerateMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        cb();
    });

    socket.on('disconnect', () => {    // when a user disconnects
        io.emit('message', generateMessage('A user has left!'));
    });

});

server.listen(port, () => {
    console.log('Server started on port 3000');
    }
);