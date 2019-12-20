const APP = require('express')();
const SERVER = require('http').createServer(APP);
const IO = require('socket.io')(SERVER);
const PORT = process.env.PORT || 3005;
const Store = require('./store');
const Words = require('./words');
const F = require('./etc');

const ROOM_LOBBY = 'LOBBY';

const STORE = new Store();
const WORDS = new Words();


const SOCKET_LOBBY_SERVER = 'SOCKET_LOBBY_SERVER';
const SOCKET_LOBBY_CLIENT = 'SOCKET_LOBBY_CLIENT';

const SOCKET_ON_LOBBY_STEP_CHANGE = 'SOCKET_ON_LOBBY_STEP_CHANGE';
const SOCKET_ON_NICKNAME_CHANGE = 'SOCKET_ON_NICKNAME_CHANGE';
const SOCKET_ON_ROOM_LIST = 'SOCKET_ON_ROOM_LIST';
const SOCKET_ON_ROOM_ADD = 'SOCKET_ON_ROOM_ADD';
const SOCKET_ON_ROOM_JOIN = 'SOCKET_ON_ROOM_JOIN';
const SOCKET_ON_ROOM_LEAVE = 'SOCKET_ON_ROOM_LEAVE';
const SOCKET_ON_ROOM = 'SOCKET_ON_ROOM';
const SOCKET_ON_CHAT = 'SOCKET_ON_CHAT';
const LOBBY_ACTION_SET_STEP = 'LOBBY_ACTION_SET_STEP';
const SOCKET_MESSAGE = 'SOCKET_MESSAGE';
const SOCKET_ON_WORD_SELECT = 'SOCKET_ON_WORD_SELECT';
const SOCKET_ON_PAINT = 'SOCKET_ON_PAINT';


const LOBBY_STEP_NICKNAME = 'LOBBY_STEP_NICKNAME';
const LOBBY_STEP_ROOM_SELECTION = 'LOBBY_STEP_ROOM_SELECTION';


const ROOM_STATUS_WAITING = 'ROOM_STATUS_WAITING';
const ROOM_STATUS_PAINTER_SELECTING = 'ROOM_STATUS_PAINTER_SELECTING';
const ROOM_STATUS_WORD_SELECTING = 'ROOM_STATUS_WORD_SELECTING';
const ROOM_STATUS_DRAWING = 'ROOM_STATUS_DRAWING';
const ROOM_STATUS_GAME_FINISHED = 'ROOM_STATUS_GAME_FINISHED';

const doAction = {
    [SOCKET_ON_LOBBY_STEP_CHANGE]:  changeStep,
    [SOCKET_ON_NICKNAME_CHANGE]:    validateNickname,
    [SOCKET_ON_ROOM_LIST]:          emitRoomList,
    [SOCKET_ON_ROOM_ADD]:           addRoom,
    [SOCKET_ON_ROOM_JOIN]:          joinRoom,
    [SOCKET_ON_ROOM]:               emitUserRoom,
    [SOCKET_ON_ROOM_LEAVE]:         leaveRoom,
    [SOCKET_ON_CHAT]:               onChat,
    [SOCKET_ON_WORD_SELECT]:        onWordSelect,
    [SOCKET_ON_PAINT]:              onPaint,
};


function onChat(socket, message) {
    const { room } = socket.user;
    STORE.chat(socket.user, message);

    if(STORE.getRoomStatus(room) === ROOM_STATUS_DRAWING && isWordGuessed(room, message)) {
        STORE.setRoomStatus(room, ROOM_STATUS_GAME_FINISHED);
        STORE.setWinner(room, socket.id);
        emitRoom(room);
        //STORE.cleanRoom(room);
        //STORE.gameRestart(room);
        setTimeout(() => {
            STORE.cleanRoom(room);
            startRoomCountdown(room);
        }, 3000);
    } else {
        emitRoom(room);
    }
}

function isWordGuessed(room, message) {
    return STORE.getWord(room) === message;
}

function sendMessage(receiver, type, message) {
    receiver.emit(SOCKET_MESSAGE, {
        message_type: type,
        message,
    });
}

function getNicknameErrors(nickname) {
    const MIN_LENGTH = 5;
    if(nickname.length < MIN_LENGTH) {
        return {
            status: 'error',
            message: `Your nickname "${nickname}" should consist at least ${MIN_LENGTH} characters. You now have ${nickname.length}`,
        };
    }
    if(nickname.indexOf('fuck') !== -1) {
        return {
            status: 'error',
            message: `Your nickname "${nickname}" has illegal characters`,
        };
    }
    if(nickname === 'SERVER') {
        return {
            status: 'error',
            message: `This nickname is for admin only :)`,
        };
    }
    if(isNicknameInUse(nickname)) {
        return {
            status: 'error',
            message: `This nickname is already in use :)`,
        };
    }
    return {
        status: 'success',
    };
}

// function getRoomPlayers(room) {
//     return IO.sockets.clients(room).sockets;
// }
//
// function update

function isNicknameInUse(nickname) {
    const sockets = IO.sockets.clients().sockets;
    return Object.keys(sockets).some(socket => sockets[socket].user.nickname === nickname);
}

function changeStep(socket, props) {

}

function validateNickname(socket, { nickname }) {
    let valid = getNicknameErrors(nickname);
    if(valid.status === 'error') {
        sendMessage(socket, 'error', valid.message);
    } else {
        socket.user.nickname = nickname;
        socket.emit(SOCKET_ON_LOBBY_STEP_CHANGE, {
            step: LOBBY_STEP_ROOM_SELECTION,
        });
    }
}

function emitRoomList(receiver=IO.in(ROOM_LOBBY)) {
    let rooms = STORE.getRoomList();
    receiver.emit(SOCKET_ON_ROOM_LIST, { rooms });
}

function addRoom(socket, { room }) {
    if(!STORE.getRoom(room)) {
        STORE.addRoom(room);
        emitRoomList();
    } else {
        sendMessage(socket, 'error', `Room ${room} is already exist!`);
    }
}

function joinRoom(socket, { room }) {
    socket.leave(ROOM_LOBBY);
    socket.join(room);
    STORE.joinRoom(socket.user, room);
    socket.user.room = room;
    emitRoomList(socket.to(ROOM_LOBBY));
    socket.emit(SOCKET_ON_ROOM_JOIN);
    if(!STORE.isTimerRunning(room) && STORE.isRoomReadyToStart(room) && !STORE.isGameRunning(room)) {
        console.log('run countdown');
        startRoomCountdown(room);
    } else {
        emitRoom(room, socket.to(room));
    }
    console.log(`A user ${socket.user.nickname} has joined room ${room}`);
}

function leaveRoom(socket) {
    const { room } = socket.user;
    if(!room) return false;
    socket.leave(room);
    STORE.leaveRoom(socket.user, room);
    if(!STORE.isTimerRunning(room) && !STORE.isRoomReadyToStart(room)) {
        STORE.cleanRoom(room);
    }
    emitRoom(room);
    socket.emit(SOCKET_ON_ROOM_LEAVE);
    socket.join(ROOM_LOBBY);
    socket.emit(SOCKET_ON_LOBBY_STEP_CHANGE, {
        step: LOBBY_STEP_ROOM_SELECTION,
    });
    emitRoomList(socket.to(ROOM_LOBBY));
    console.log(`A user ${socket.user.nickname} has left room ${room}`);
}

function emitUserRoom(socket) {
    const { room } = socket.user;
    emitRoom(room, socket);
}

function emitRoom(room, receiverProp) {
    let receiver = receiverProp || IO.in(room);
    receiver.emit(SOCKET_ON_ROOM, {
        room: STORE.getRoom(room),
    });
}

function startRoomCountdown(room) {
    STORE.setRoomStatus(room, ROOM_STATUS_PAINTER_SELECTING);
    console.log('starting ' + room);
    let counter = 0;
    STORE.setTimer(
        room,
        () => {
            emitRoom(room);
            console.log('emit ' + ++counter);
        }
    );
}

function onWordSelect(socket, word) {
    const { room } = socket.user;
    STORE.setWord(room, word);
    STORE.setRoomStatus(room, ROOM_STATUS_DRAWING);
    emitRoom(room);
}

function onPaint(socket, image) {
    const { room } = socket.user;
    STORE.setImage(room, image);
    emitRoom(room);
}

// function setPainter() {
//
// }














function onConnected(socket) {
    const { id } = socket;
    socket.user = {};
    socket.user.id = id;
    socket.join(ROOM_LOBBY);
    console.log('connected ' + id);
}

function onDisconnected(socket) {
    const { id } = socket;
    console.log('disconnected ' + id);
    doAction[SOCKET_ON_ROOM_LEAVE](socket);
}

IO.on('connection', socket => {
    onConnected(socket);
    socket.on('disconnect', () => {
        onDisconnected(socket);
    });
    socket.on(SOCKET_ON_LOBBY_STEP_CHANGE, props => {
        doAction[SOCKET_ON_LOBBY_STEP_CHANGE](socket, props);
    });
    socket.on(SOCKET_ON_NICKNAME_CHANGE, props => {
        doAction[SOCKET_ON_NICKNAME_CHANGE](socket, props);
    });
    socket.on(SOCKET_ON_ROOM_LIST, () => {
        doAction[SOCKET_ON_ROOM_LIST](socket);
    });
    socket.on(SOCKET_ON_ROOM_ADD, props => {
        doAction[SOCKET_ON_ROOM_ADD](socket, props);
    });
    socket.on(SOCKET_ON_ROOM_JOIN, props => {
        doAction[SOCKET_ON_ROOM_JOIN](socket, props);
    });
    socket.on(SOCKET_ON_ROOM, () => {
        doAction[SOCKET_ON_ROOM](socket);
    });
    socket.on(SOCKET_ON_ROOM_LEAVE, () => {
        doAction[SOCKET_ON_ROOM_LEAVE](socket);
    });
    socket.on(SOCKET_ON_CHAT, message => {
        doAction[SOCKET_ON_CHAT](socket, message);
    });
    socket.on(SOCKET_ON_WORD_SELECT, word => {
        doAction[SOCKET_ON_WORD_SELECT](socket, word);
    });
    socket.on(SOCKET_ON_PAINT, image => {
        doAction[SOCKET_ON_PAINT](socket, image);
    });
});

SERVER.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
