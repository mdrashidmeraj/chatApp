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

});

server.listen(port, () => {
    console.log('Server started on port 3000');
    }
);