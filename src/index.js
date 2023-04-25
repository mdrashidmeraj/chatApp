import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

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

    socket.emit('message', 'Welcome!');

    socket.broadcast.emit('message', 'A new user has joined!'); // to all except the current user

    socket.on('sendMessage', (message, cb) => {
        console.log(message);
        io.emit('message', message);
        cb("Delivered");    // to acknowledge the event
    });

    socket.on('sendLocation', (coords) => {
        console.log(coords);
        io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
    });

    socket.on('disconnect', () => {    // when a user disconnects
        io.emit('message', 'A user has left!');
    });

});

server.listen(port, () => {
    console.log('Server started on port 3000');
    }
);