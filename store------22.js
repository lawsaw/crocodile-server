const INITIAL_ROOM = {
    chat: [],
    players: {},
    roomName: 'Default name',
    image: '',
};

const COUNTDOWN = 15;

const ROOM_STATUS_WAITING = 'ROOM_STATUS_WAITING';
const ROOM_STATUS_PAINTER_SELECTING = 'ROOM_STATUS_PAINTER_SELECTING';
const ROOM_STATUS_WORD_SELECTING = 'ROOM_STATUS_WORD_SELECTING';
const ROOM_STATUS_DRAWING = 'ROOM_STATUS_DRAWING';
const ROOM_STATUS_GAME_FINISHED = 'ROOM_STATUS_GAME_FINISHED';

let Store = function() {

    let words = [
        'Собака',
        'Слон',
        'Дом',
        'Дождь',
        'Снег',
        'Сейф',
        'Гитара',
        'Стакан',
    ];

    let store = {
        'default room 2':  {
            status: ROOM_STATUS_WAITING,
            chat: [],
            players: {},
            roomName: 'default room 2',
            image: null,
            words: [],
            word: null,
            winner: null,
            countdown: COUNTDOWN,
            timer: null,
        },
        'default room 1':  {
            status: ROOM_STATUS_WAITING,
            chat: [],
            players: {},
            roomName: 'default room 1',
            image: null,
            words: [],
            word: null,
            winner: null,
            countdown: COUNTDOWN,
            timer: null,
        },
    };

    getRoomList = () => {
        return Object.keys(store).map(room => ({
            room,
            players: Object.keys(store[room].players).length,
        }));
    }

    joinRoom = (user, room) => {
        const { id, ...userProps } = user;
        store[room].players[id] = userProps;
    }

    leaveRoom = (user, room) => {
        const { id } = user;
        delete store[room].players[id];
    }

    getRoom = (room) => {
        return store[room];
    }

    getRoomPlayersCount = (room) => {
        return Object.keys(store[room].players).length;
    }

    getRoomStatus = (room) => {
        return store[room].status;
    }

    setCountdown = (room, countdown) => {
        store[room].countdown = countdown;
    }

    resetCountdown = (room) => {
        store[room].countdown = COUNTDOWN;
    }

    getCountdown = (room) => {
        return store[room].countdown;
    }

    setTimer = (room, timer) => {
        store[room].timer = timer;
    }

    getTimer = (room) => {
        return store[room].timer;
    }

    isTimerRunning = (room) => {
        return store[room].timer !== null;
    }

    getRoomStatus = (room) => {
        return store[room].status;
    }

    setRoomStatus = (room, status) => {
        store[room].status = status;
    }

    return {
        getRoomList,
        joinRoom,
        leaveRoom,
        getRoom,
        getRoomPlayersCount,
        getRoomStatus,
        setCountdown,
        resetCountdown,
        getCountdown,
        setTimer,
        getTimer,
        isTimerRunning,
        getRoomStatus,
        setRoomStatus,
    }

};

module.exports = Store;