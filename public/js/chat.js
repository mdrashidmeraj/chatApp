const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages'); // location where we will render the messages

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML; // innerHTML gives us the html inside the element
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }); // ignoreQueryPrefix removes the ? from the query string

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild; // last message
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage); // get the styles of the last message
    const newMessageMargin = parseInt(newMessageStyles.marginBottom); // get the margin of the last message
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin; // get the height of the last message
    // Visible height
    const visibleHeight = $messages.offsetHeight; // height of the messages container
    // Height of messages container
    const containerHeight = $messages.scrollHeight; // total height of the messages container
    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight; // scrollTop gives the distance from the top of the container to the top of the scrollbar
    if(containerHeight - newMessageHeight <= scrollOffset) { // if we are at the bottom before the new message is added
        $messages.scrollTop = $messages.scrollHeight; // scroll to the bottom
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        createdAt: moment(message.createdAt).format('h:mm a'),
        message: message.text,
        userName : message.userName
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (url) => {
    const html = Mustache.render(locationMessageTemplate, {
        createdAt: moment(url.createdAt).format('h:mm a'),
        url: url.url,
        username: url.username
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});


document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault();   // prevent full page refresh

    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error) {
            return console.log(error);
        }
        console.log('Message delivered!');
    });
});

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared!');
        });
    });
});

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    }
});