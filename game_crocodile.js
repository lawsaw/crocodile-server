const TARGET = 'GAME_CROCODILE';

//EMIT
const LOBBY_UPDATE_CONFIG = 'LOBBY_UPDATE_CONFIG';
const UPDATE_ROOM_LIST = 'UPDATE_ROOM_LIST';
const UPDATE_ROOM = 'UPDATE_ROOM';

//LISTEN
const VALIDATE_NICKNAME = 'VALIDATE_NICKNAME';
const JOIN_ROOM = 'JOIN_ROOM';
const LEAVE_ROOM = 'LEAVE_ROOM';
const WORD_SELECT = 'WORD_SELECT';
const PAINT = 'PAINT';
const CHAT = 'CHAT';
const MESSAGE_MARK = 'MESSAGE_MARK';

//LOBBY STEPS
const LOBBY_STEP_NICKNAME = 'LOBBY_STEP_NICKNAME';
const LOBBY_STEP_ROOM_SELECTION = 'LOBBY_STEP_ROOM_SELECTION';

//ROOM STATUSES
const ROOM_STATUS_WAITING = 'ROOM_STATUS_WAITING';
const ROOM_STATUS_PAINTER_SELECTING = 'ROOM_STATUS_PAINTER_SELECTING';
const ROOM_STATUS_WORD_SELECTING = 'ROOM_STATUS_WORD_SELECTING';
const ROOM_STATUS_DRAWING = 'ROOM_STATUS_DRAWING';
const ROOM_STATUS_GAME_FINISHED = 'ROOM_STATUS_GAME_FINISHED';

const TIME_TO_RESET_GAME = 5000;

const ROOM_LOBBY = 'LOBBY';

const Store = require('./store');
const STORE = new Store();

let GameCrocodile = function(IO, common) {

    socketEmitCrocodile = (receiver, action, args) => {
        common.emit(receiver, TARGET, action, args);
    }

    // addRoom = (socket, { room }) => {
    //     if(!STORE.getRoom(room)) {
    //         STORE.addRoom(room);
    //         emitRoomList();
    //     } else {
    //         common.sendMessage(socket, 'error', `Room ${room} is already exist!`);
    //     }
    // }

    updateRoomList = (receiver=IO.in(ROOM_LOBBY)) => {
        let rooms = STORE.getRoomList();
        socketEmitCrocodile(receiver, UPDATE_ROOM_LIST, {
            rooms
        });
    }

    updateRoom = (room, receiverProp) => {
        let receiver = receiverProp || IO.in(room);
        socketEmitCrocodile(receiver, UPDATE_ROOM, {
            room: STORE.getRoom(room),
        });
    }

    validateNickname = (socket, { nickname }) => {
        if(common.validateNickname(socket, nickname)) {
            updateRoomList(socket);
            socketEmitCrocodile(socket, LOBBY_UPDATE_CONFIG, {
                step: LOBBY_STEP_ROOM_SELECTION,
            });
        }
    }

    joinRoom = (socket, { room }) => {
        socket.leave(ROOM_LOBBY);
        socket.join(room);
        STORE.joinRoom(socket.user, room);
        socket.user.room = room;
        updateRoomList(socket.to(ROOM_LOBBY));
        updateRoom(room);
        if(!STORE.isTimerRunning(room) && STORE.isRoomReadyToStart(room) && !STORE.isGameRunning(room)) {
            startRoomCountdown(room);
        } else {
            updateRoom(room, socket.to(room));
        }
    }

    leaveRoom = (socket) => {
        const { room } = socket.user;
        if(!room) return false;
        let isPlayerPainter = STORE.isPlayerPainter(room, socket.id);
        socket.leave(room);
        STORE.leaveRoom(socket.user, room);
        delete socket.user.room;
        if(!STORE.isTimerRunning(room) && !STORE.isRoomReadyToStart(room)) {
            STORE.cleanRoom(room);
        }
        if(STORE.isGameRunning(room) && isPlayerPainter && STORE.isRoomReadyToStart(room)) {
            resetGame(room, 0);
        }
        updateRoom(room);
        socket.join(ROOM_LOBBY);
        updateRoomList();
    }

    resetGame = (room, timeout=TIME_TO_RESET_GAME) => {
        setTimeout(() => {
            STORE.cleanRoom(room);
            updateRoom(room);
            startRoomCountdown(room);
        }, timeout);
    }

    startRoomCountdown = (room) => {
        STORE.setRoomStatus(room, ROOM_STATUS_PAINTER_SELECTING);
        STORE.setTimer(
            room,
            () => {
                updateRoom(room);
            }
        );
    }

    wordSelect = (socket, { word }) => {
        const { room } = socket.user;
        STORE.setWord(room, word);
        STORE.setRoomStatus(room, ROOM_STATUS_DRAWING);
        updateRoom(room);
    }

    paint = (socket, { image }) => {
        const { room } = socket.user;
        STORE.setImage(room, image);
        updateRoom(room);
    }

    chat = (socket, { message }) => {
        const { room } = socket.user;
        STORE.chat(socket.user, message);
        if(STORE.getRoomStatus(room) === ROOM_STATUS_DRAWING && STORE.isWordGuessed(room, message)) {
            STORE.setRoomStatus(room, ROOM_STATUS_GAME_FINISHED);
            STORE.setWinner(room, socket.id);
            updateRoom(room);
            resetGame(room);
        } else {
            updateRoom(room);
        }
    }

    messageMark = (socket, { id, value }) => {
        const { room } = socket.user;
        STORE.messageLikeToggle(room, id, value);
        updateRoom(room);
    }

    return {
        [VALIDATE_NICKNAME]: validateNickname,
        [JOIN_ROOM]:         joinRoom,
        [LEAVE_ROOM]:        leaveRoom,
        [WORD_SELECT]:       wordSelect,
        [PAINT]:             paint,
        [CHAT]:              chat,
        [MESSAGE_MARK]:      messageMark,
    }

};

module.exports = GameCrocodile;