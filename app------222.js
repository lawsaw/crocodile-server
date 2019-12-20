const APP = require('express')();
const SERVER = require('http').createServer(APP);
const IO = require('socket.io')(SERVER);
const PORT = process.env.PORT || 3005;
// const REDIS = require('redis');
// const STORE = REDIS.createClient();
const Store = require('./store');
const Words = require('./words');
const F = require('./etc');

const SOCKET_CHANNEL_INIT_FROM            = 'SOCKET_CHANNEL_INIT_SERVER';
const SOCKET_CHANNEL_MESSAGE_FROM         = 'SOCKET_CHANNEL_MESSAGE_SERVER';
const SOCKET_CHANNEL_LOBBY_FROM           = 'SOCKET_CHANNEL_LOBBY_SERVER';
const SOCKET_CHANNEL_ROOM_ACCESS_FROM     = 'SOCKET_CHANNEL_ROOM_ACCESS_SERVER';
const SOCKET_CHANNEL_ROOM_ADD_FROM        = 'SOCKET_CHANNEL_ROOM_ADD_SERVER';
const SOCKET_CHANNEL_CALLBACK_FROM        = 'SOCKET_CHANNEL_CALLBACK_SERVER';
const SOCKET_CHANNEL_ROOM_FROM            = 'SOCKET_CHANNEL_ROOM_SERVER';

const SOCKET_CHANNEL_INIT_TO              = 'SOCKET_CHANNEL_INIT_CLIENT';
const SOCKET_CHANNEL_MESSAGE_TO           = 'SOCKET_CHANNEL_MESSAGE_CLIENT';
const SOCKET_CHANNEL_LOBBY_TO             = 'SOCKET_CHANNEL_LOBBY_CLIENT';
const SOCKET_CHANNEL_ROOM_ACCESS_TO       = 'SOCKET_CHANNEL_ROOM_ACCESS_CLIENT';
const SOCKET_CHANNEL_ROOM_ADD_TO          = 'SOCKET_CHANNEL_ROOM_ADD_CLIENT';
const SOCKET_CHANNEL_CALLBACK_TO          = 'SOCKET_CHANNEL_CALLBACK_CLIENT';
const SOCKET_CHANNEL_ROOM_TO              = 'SOCKET_CHANNEL_ROOM_CLIENT';


const LOBBY_ACTION_JOIN = 'LOBBY_ACTION_JOIN';
const LOBBY_ACTION_LEAVE = 'LOBBY_ACTION_LEAVE';

const ROOM_ACTION_JOIN = 'ROOM_ACTION_JOIN';
const ROOM_ACTION_LEAVE = 'ROOM_ACTION_LEAVE';
const ROOM_ACTION_UPDATE = 'ROOM_ACTION_UPDATE';

const ROOM_STATUS_WAITING = 'ROOM_STATUS_WAITING';
const ROOM_STATUS_PAINTER_SELECTING = 'ROOM_STATUS_PAINTER_SELECTING';
const ROOM_STATUS_WORD_SELECTING = 'ROOM_STATUS_WORD_SELECTING';
const ROOM_STATUS_DRAWING = 'ROOM_STATUS_DRAWING';
const ROOM_STATUS_GAME_FINISHED = 'ROOM_STATUS_GAME_FINISHED';

const ROOM_LOBBY = 'LOBBY';

const STORE = new Store();
const WORDS = new Words();

function onConnected(socket) {
    const { id } = socket;
    socket.user = {};
    socket.user.id = id;
    console.log('connected ' + id);
}

function onDisconnected(socket) {
    const { id } = socket;
    console.log('disconnected ' + id);
    leaveRoom(socket);
    delete socket.user;
}

function socketOnInit(socket, props) {
    let valid = validateUser(props);
    if(valid !== true) {
        sendMessage(socket, 'error', valid);
        return false;
    }
    socket.user = {
        ...socket.user,
        ...props,
    }
    handleLobby(socket, LOBBY_ACTION_JOIN);
    socketToInit(socket);
    sendMessage(socket, 'success', 'You successfully updated your profile!');
}

function validateUser(props) {
    const { nickname } = props;
    if(nickname) {
        if(nickname.length < 3) {
            return `Your nickname "${nickname}" is too small`;
        }
        if(nickname.indexOf('fuck') !== -1) {
            return `Your nickname "${nickname}" has illegal characters`;
        }
    }
    return true;
}

function socketToInit(socket) {
    socket.emit(SOCKET_CHANNEL_INIT_TO, socket.user);
}

function sendMessage(receiver, type, message) {
    receiver.emit(SOCKET_CHANNEL_MESSAGE_TO, {
        message_type: type,
        message,
    });
}

function handleLobby(socket, action) {
    switch (action) {
        case LOBBY_ACTION_JOIN:
            socket.join(ROOM_LOBBY);
            break;
        case LOBBY_ACTION_LEAVE:
            socket.leave(ROOM_LOBBY);
            break;
        default:
            break;
    }
    socketToLobby();
}

function socketToLobby() {
    let rooms = STORE.getRoomList();
    IO.in(ROOM_LOBBY).emit(SOCKET_CHANNEL_LOBBY_TO, { rooms });
}

function socketOnRoomAccess(socket, { action, room, ...props }) {
    switch (action) {
        case ROOM_ACTION_JOIN:
            joinRoom(socket, room);
            handleLobby(socket, LOBBY_ACTION_LEAVE);
            break;
        case ROOM_ACTION_LEAVE:
            leaveRoom(socket);
            handleLobby(socket, LOBBY_ACTION_JOIN);
            socket.emit(SOCKET_CHANNEL_ROOM_ACCESS_TO, { action });
            break;
        default:
            break;
    }
    //emitRoomAccess(room);
    doCallback(socket, props);
}

function emitRoomAccess(room) {
    IO.in(room).emit(SOCKET_CHANNEL_ROOM_ACCESS_TO, {
        action: ROOM_ACTION_UPDATE,
        room: STORE.getRoom(room),
    });
}

function emitRoom(room) {
    IO.in(room).emit(SOCKET_CHANNEL_ROOM_TO, {
        room: STORE.getRoom(room),
    });
}

function joinRoom(socket, room) {
    socket.join(room);
    STORE.joinRoom(socket.user, room);
    socket.user.room = room;
    if(!STORE.isTimerRunning(room) && isRoomReadyToStart(room)) {
        console.log('run countdown');
        startRoomCountdown(room);
    } else {
        emitRoomAccess(room);
    }
    console.log(`A user ${socket.user.nickname} has joined room ${room}`);
}

function leaveRoom(socket) {
    if(!socket.user.room) return false;
    const { room } = socket.user;
    socket.leave(room);
    STORE.leaveRoom(socket.user, room);
    delete socket.user.room;
    if(STORE.isTimerRunning(room) && !isRoomReadyToStart(room)) {
        resetRoomTimer(room);
    } else {
        emitRoomAccess(room);
    }
    console.log(`A user ${socket.user.nickname} has left room ${room}`);
}

function doCallback(socket, { callback, args={} }) {
    if(!callback) return false;
    socket.emit(SOCKET_CHANNEL_CALLBACK_TO, { callback, args });
}

function isRoomReadyToStart(room) {
    let roomPlayersCount = STORE.getRoomPlayersCount(room);
    let roomStatus = STORE.getRoomStatus(room);
    if(roomPlayersCount > 1) return true;
    return false;
}

function resetRoomTimer(room) {
    STORE.setRoomStatus(room, ROOM_STATUS_WAITING);
    clearInterval(STORE.getTimer(room));
    STORE.resetCountdown(room);
}

function startRoomCountdown(room) {
    STORE.setRoomStatus(room, ROOM_STATUS_PAINTER_SELECTING);
    setTimeout(() => STORE.setTimer(room,
        setInterval(() => {
            STORE.setCountdown(room, STORE.getCountdown(room)-1);
            if(!isRoomReadyToStart(room)) resetRoomTimer(room);
            if(STORE.getCountdown(room) === 0) resetRoomTimer(room);
            emitRoom(room);
        }, 1000)
    ), 1000);
}

IO.on('connection', socket => {
    onConnected(socket);
    socket.on('disconnect', () => {
        onDisconnected(socket);
    });
    socket.on(SOCKET_CHANNEL_INIT_FROM, props => {
        socketOnInit(socket, props);
    });
    socket.on(SOCKET_CHANNEL_ROOM_ACCESS_FROM, props => {
        socketOnRoomAccess(socket, props);
    });
});

SERVER.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
