import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Filter from 'bad-words';
import { generateMessage, locationGenerateMessage } from './utils/messages.js';
import { addUser, removeUser, getUser, getUsersInRoom } from './utils/users.js';

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

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if(error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage('Welcome!', "Admin")); // to the current user
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, "Admin")); // to all except the current user
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on('sendMessage', (message, cb) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return cb('Profanity is not allowed!');
        }
        io.to(user.room).emit('message', generateMessage(message, user.username));
        cb("Delivered");    // to acknowledge the event
    });

    socket.on('sendLocation', (coords, cb) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', locationGenerateMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`, user.username));
        cb();
    });

    socket.on('disconnect', () => {    // when a user disconnects
        const user = removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`, "Admin"));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });

});

server.listen(port, () => {
    console.log('Server started on port 3000');
    }
);