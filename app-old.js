const APP = require('express')();
const SERVER = require('http').createServer(APP);
const IO = require('socket.io')(SERVER);
const PORT = process.env.PORT || 3005;
// const REDIS = require('redis');
// const STORE = REDIS.createClient();
const Store = require('./store');
const Words = require('./words');
const F = require('./etc');

const ROOM_STATUS_PAINTER_SELECTING = 'PAINTER_SELECTING';
const ROOM_STATUS_WORD_SELECTING = 'WORD_SELECTING';
const ROOM_STATUS_DRAWING = 'DRAWING';
const ROOM_STATUS_WAITING = 'WAITING';
const ROOM_STATUS_GAME_FINISHED = 'FINISHED';

const STORE = new Store();
const WORDS = new Words();

const SOCKET_TO             = 'CLIENT';
const SOCKET_FROM           = 'SERVER';
const EMIT_INIT             = 'INIT';
const EMIT_NEW_ROOM         = 'NEW ROOM';
const EMIT_MESSAGE          = 'MESSAGE';
const EMIT_ROOM_SELECT      = 'ROOM SELECT';
const EMIT_UPDATED_ROOM             = 'GAME';
const EMIT_LEAVE_SESSION    = 'LEAVE SESSION';
const EMIT_ROOM_LIST        = 'ROOM LIST';
const EMIT_PLAYER_UPDATE    = 'PLAYER UPDATE';
const EMIT_CALLBACK         = 'CALLBACK';
const ON_PLAYER_UPDATE      = 'PLAYER UPDATE';
const EMIT_LOG              = 'LOG';
const EMIT_START            = 'START';
const EMIT_PRESTART         = 'PRE START';
const EMIT_LOBBY            = 'LOBBY';
const ON_HOST_FIND          = 'HOST FIND';
const ON_INIT               = 'INIT';
const ON_LEAVE_SESSION      = 'LEAVE SESSION';
const ON_ROOM_ACCESS          = 'ROOM';
const ON_CHAT          = 'CHAT';

const ON_NEW_ROOM           = 'NEW ROOM';
const ON_ROOM_SELECT        = 'ROOM SELECT';
const ON_ROOM_UPDATE               = 'GAME';
const ON_LOBBY              = 'LOBBY';
const ON_START              = 'START';
const ON_ROOM_LOBBY           = 'PRE START';
const EMIT_ROOM_ACCESS         = 'ROOM';
const EMIT_CHAT         = 'CHAT';

const LOBBY_ROOM_STEP_INIT = 'INIT';

const ROOM_LOBBY = 'LOBBY';

const emit = (receiver, type, props) => {
    receiver.emit(SOCKET_TO, {
        type,
        ...props,
    });
};

const emitLog = () => {

    emit(IO, EMIT_LOG, {
        store: STORE.getStore(),
    });
};

const emitToLobby = (props) => {
    emit(IO.in(ROOM_LOBBY), EMIT_LOBBY, props);
};

const emitRoomList = () => {
    let roomList = STORE.roomList();
    emitToLobby({
        roomList,
    });
};

const emitUpdatedRoom = (room) => {
    let roomStore = STORE.getRoom(room);
    emit(IO.in(room), EMIT_UPDATED_ROOM, {
        room: roomStore,
    });
};

const emitUpdatedRoomToPlayer = (socket, room) => {
    let roomStore = STORE.getRoom(room);
    emit(socket, EMIT_UPDATED_ROOM, {
        room: roomStore,
    });
};

const onRoomUpdate = (socket, props) => {
    const { room, id } = socket.user;
    emitCallback(socket, props);
    setNewWord(socket, props);
    //doClientAction(socket, props);
    doRoomAction(room, props);
    saveImage(room, props);
    //sendChatToRoom(room, props);
    emitUpdatedRoom(room);
};

const saveImage = (room, props) => {
    const { image } = props;
    if(!image) return false;
    STORE.updateImage(room, image);
};

const sendChatToRoom = (room, { chat }) => {
    if(!chat) return false;
    STORE.updateChat(room, {
        id: 'SERVER',
        ...chat,
    });
    const { id, message } = chat;
    emit(IO.in(room), EMIT_CHAT, {
        chat: getChat(room),
    });
    if(id !== 'SERVER') {
        handleWordGuessing(room, chat);
    }
};

const handleWordGuessing = (room, { id, message }) => {
    let status = getCurrentRoomStatus(room);
    if(status === ROOM_STATUS_DRAWING) {
        let word = getCurrentRoomWord(room);
        if(word === message) {
            console.log(word);
            setRoomStatus(room, ROOM_STATUS_GAME_FINISHED);
            setWinner(room, id);
            initGameRestarting(room);
            emitUpdatedRoom(room);
        }
    }
};

const cleanRoom = (room) => {
    STORE.cleanRoom(room);
};

const initGameRestarting = (room) => {
    setTimeout(() => {
        cleanRoom(room);
        if(isRoomReadyToStartGame(room)) {
            setRoomTimerToStart(room);
        }
    }, 3000);
};

const setRoomStatus = (room, status) => {
    STORE.setRoomStatus(room, status);
};

const setWinner = (room, winnerId) => {
    return STORE.setWinner(room, winnerId);
};

const getCurrentRoomWord = (room) => {
    return STORE.getRoomWord(room);
};

const getCurrentRoomStatus = (room) => {
    return STORE.getRoomStatus(room);
};

// const doClientAction = (socket, { action }) => {
//     if(!action) return false;
//     switch(action) {
//         case 'LEAVE':
//             leaveRoom(socket);
//             break;
//         default:
//             break;
//     }
// };

const doRoomAction = (room, { status, word }) => {
    if(!status) return false;
    setRoomStatus(room, status);
    switch(status) {
        case ROOM_STATUS_WAITING:
            break;
        case ROOM_STATUS_PAINTER_SELECTING:
            //STORE.setRandomPainter(room);
            break;
        case ROOM_STATUS_WORD_SELECTING:
            STORE.setRandomPainter(room);
            break;
        case ROOM_STATUS_DRAWING:
            if(word) {
                STORE.setWord(room, word);
            }
            break;
        default:
            break;
    }
};

const onPlayerUpdate = (socket, props) => {
    socket.user = props.user || socket.user;
    let id = null;
    let args = [];
    if(socket.user && !socket.user.id) {
        id = socket.id;
        socket.user['id'] = id;
        args.push(id);
    }
    doPlayerAction(socket, props);
    emitCallback(socket, props, args);
};

const doPlayerAction = (receiver, { action }) => {
    if(!action) return false;
    switch (action) {
        case 'LEAVE':
            leaveRoom(receiver);
            break;
        default:
            break;
    }
};

const emitCallback = (receiver, props, args=[]) => {
    const { callback } = props;
    if(callback) emit(receiver, EMIT_CALLBACK, { callback: props.callback, args });
};

const joinLobby = (receiver) => {
    receiver.join(ROOM_LOBBY);
    emitRoomList();
};

const leaveLobby = (receiver) => {
    receiver.leave(ROOM_LOBBY);
    emitRoomList();
};

const onRoomCreate = (receiver, props) => {
    const { room } = props;
    if(STORE.isRoomExist(room)) {
        emit(receiver, EMIT_MESSAGE, {
            messageType: 'error',
            message: `Room ${room} is already exist`,
        });
        return false;
    }
    STORE.addRoom(room);
    emitRoomList();
    emitCallback(receiver, props);
    //emitLog();
};

const joinRoom = (socket, room) => {
    socket.user['room'] = room;
    socket.join(room);
    STORE.joinRoom(socket.user, room);
    console.log(`A user ${socket.user.nickname} has joined room ${room}`);
    sendChatToRoom(room, {
        chat: {
            message: `${socket.user.nickname} has joined`,
        },
    });
    leaveLobby(socket);

    //emitUpdatedRoomToPlayer

    if(!isTimerRunning(room)) {
        if(isRoomReadyToStartGame(room)) {
            setRoomTimerToStart(room);
        } else {
            emitUpdatedRoom(room);
        }
    }



    //emitCallback(socket, props);
    //emitLog();
};

const isTimerRunning = (room) => {
    return STORE.isTimerRunning(room);
};

const setTimer = (room, timer) => {
    STORE.setTimer(room, timer);
};

const setCountdown = (room, countdown) => {
    STORE.setCountdown(room, countdown);
};

const resetCountdown = (room) => {
    STORE.resetCountdown(room);
};

const getCountdown = (room) => {
    return STORE.getCountdown(room);
};

const getTimer = (room) => {
    return STORE.getTimer(room);
};

const setRoomTimerToStart = (room) => {
    doRoomAction(room, {
        status: ROOM_STATUS_PAINTER_SELECTING,
    });
    setTimer(room,
        setInterval(() => {
            setCountdown(room, getCountdown(room) - 1);
            if(!isRoomReadyToStartGame(room)) {
                clearInterval(getTimer(room));
            }
            if(getCountdown(room) === 0) {
                clearInterval(getTimer(room));
                doRoomAction(room, {
                    status: ROOM_STATUS_WORD_SELECTING,
                });
            }
            emitUpdatedRoom(room);
        }, 1000)
    );
};

const getRoomPlayersCount = (room) => {
    return STORE.getRoomPlayersCount(room);
}

const isRoomReadyToStartGame = (room) => {
    let playersCount = getRoomPlayersCount(room);
    let status = getCurrentRoomStatus(room);
    if(playersCount > 1 && (status === ROOM_STATUS_WAITING || status === ROOM_STATUS_PAINTER_SELECTING)) {
       return true
    }
    return false;
};

const setNewWord = (socket, { word }) => {
    if(!word) return false;
    const { room } = socket.user;
    STORE.setWord(room, word);
};

const leaveRoom = (socket) => {
    if(socket.user && socket.user.room) {
        const { nickname, room } = socket.user;
        socket.leave(room);
        STORE.leaveRoom(socket.id, room);
        if(!isTimerRunning(room)) {
            emitUpdatedRoom(room);
        }
        console.log(`A user ${nickname} has left room ${room}`);
        sendChatToRoom(room, {
            chat: {
                message: `${nickname} has left`,
            },
        });
        delete socket.user.room;
        joinLobby(socket);

        if(isTimerRunning(room) && !isRoomReadyToStartGame(room)) {
            clearInterval(getTimer(room));
            setTimer(room, null);
            setRoomStatus(room, ROOM_STATUS_WAITING);
            resetCountdown(room);
            emitUpdatedRoom(room);
        }

        //emitLog();
    }
};

const onConnected = (socket) => {
    joinLobby(socket);
    console.log('connected ' + socket.id);
};


const onDisconnected = (socket) => {
    leaveRoom(socket);
    leaveLobby(socket);
    console.log('disconnected ' + socket.id);
};

const onRoomAccess = (socket, { room, event, ...props }) => {
    switch (event) {
        case 'JOIN':
            if(room) {
                joinRoom(socket, room);
            }
            break;
        case 'LEAVE':
            leaveRoom(socket);
            break;
        default:
            break;
    }
    emitCallback(socket, props);
};

// const onChat = (socket, { chat }) => {
//     let { room } = socket.user;
//     if(!chat) return false;
//     STORE.updateChat(room, {
//         id: 'SERVER',
//         ...chat,
//     });
//     emit(IO.in(room), EMIT_CHAT, {
//         chat: getChat(room),
//     });
// };

const getChat = (room) => {
    return STORE.getChat(room);
};

IO.on('connection', socket => {

    onConnected(socket);

    socket.on('disconnect', () => {
        onDisconnected(socket);
    });

    socket.on(SOCKET_FROM, ({ type, ...props }) => {

        switch(type) {
            case ON_PLAYER_UPDATE:
                onPlayerUpdate(socket, props);
                break;
            case ON_NEW_ROOM:
                onRoomCreate(socket, props);
                break;
            case ON_ROOM_SELECT:
                joinRoom(socket, props);
                break;
            case ON_ROOM_UPDATE:
                onRoomUpdate(socket, props);
                break;
            case ON_ROOM_ACCESS:
                onRoomAccess(socket, props);
                break;
            case ON_CHAT:
                sendChatToRoom(socket.user.room, props);
                break;
            case '5':
                break;
        }
    });

});

SERVER.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
