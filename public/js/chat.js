const socket = io();

socket.on('message', (message) => {
    console.log(message);
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault();   // prevent full page refresh

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (msg) => {
        console.log(msg);
    });
});

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    });
});