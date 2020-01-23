const INITIAL_ROOM = {
    chat: [],
    players: {},
    roomName: 'Default name',
    image: '',
};

function getRandomValue(max=999999, min=111111) {
    return Math.round(Math.random() * (max - min) + min);
}

const COUNTDOWN = 10;

const ROOM_STATUS_WAITING = 'ROOM_STATUS_WAITING';
const ROOM_STATUS_PAINTER_SELECTING = 'ROOM_STATUS_PAINTER_SELECTING';
const ROOM_STATUS_WORD_SELECTING = 'ROOM_STATUS_WORD_SELECTING';
const ROOM_STATUS_DRAWING = 'ROOM_STATUS_DRAWING';
const ROOM_STATUS_GAME_FINISHED = 'ROOM_STATUS_GAME_FINISHED';

const STATIC_ROOMS = [
    'Room 1',
    'Room 2',
    'Room 3',
];

let Store = function() {

    let words = [
        'Орбита',
        'Слон',
        'Хижина',
        'Дождь',
        'Снеговик',
        'Сейф',
        'Гитара',
        'Стакан',
        'Конь',
        'Гипотенуза',
        'Вишня',
        'Петух',
        'Лыжи',
        'Веник',
        'Ракета',
        'Паук',
    ];

    let store = {};
    let timers = {};

    STATIC_ROOMS.forEach(room => {
        store[room] = {
            status: ROOM_STATUS_WAITING,
            chat: [],
            players: {},
            roomName: room,
            image: null,
            words: [],
            word: null,
            winner: {},
            countdown: COUNTDOWN,
            timer: false,
            painter: {},
        };
        timers[room] = null;
    });

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

    addRoom = (room) => {
        store[room] = {
            status: ROOM_STATUS_WAITING,
            statusText: STATUS_MAP[ROOM_STATUS_WAITING](),
            chat: [],
            players: {},
            roomName: room,
            image: null,
            words: [],
            word: null,
            winner: {},
            countdown: COUNTDOWN,
            timer: false,
            painter: {},
        };
        timers[room] = null;
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
        store[room].timer = false;
        clearInterval(timers[room]);
        store[room].countdown = COUNTDOWN;
    }

    getCountdown = (room) => {
        return store[room].countdown;
    }

    setTimer = (room, emit) => {
        store[room].timer = true;
        timers[room] = setInterval(() => {
            setCountdown(room, getCountdown(room)-1);
            if(!isRoomReadyToStart(room)) {
                resetCountdown(room);
                resetRoom(room);
            } else if(getCountdown(room) === 0) {
                resetCountdown(room);
                setRoomStatus(room, ROOM_STATUS_WORD_SELECTING);
                setPainter(room);
            }
            emit();
        }, 1000);
    }

    resetPainter = (room) => {
        store[room].painter = null;
        store[room].words = [];
        store[room].word = null;
    }

    setPainter = (room) => {
        resetPainter(room);
        let arrayOfIds = Object.keys(store[room].players);
        let randomId = Math.ceil(Math.random() * arrayOfIds.length-1);
        let playerId = arrayOfIds[randomId];
        let words = getRandomWordList();
        store[room].words = words;
        store[room].painter = {
            ...store[room].players[playerId],
            id: playerId,
        };
    }

    getRandomWordList = (count=3, arr=[]) => {
        if(arr.length < count) {
            let word = words[Math.ceil(Math.random() * words.length-1)];
            if(!arr.includes(word)) arr.push(word);
            return getRandomWordList(count, arr);
        }
        else return arr;
    }

    resetRoom = (room) => {
        setRoomStatus(room, ROOM_STATUS_WAITING);
    }

    isGameRunning = (room) => {
        return getRoomStatus(room) !== ROOM_STATUS_WAITING;
    }

    isTimerRunning = (room) => {
        return store[room].timer;
    }

    getRoomStatus = (room) => {
        return store[room].status;
    }

    setRoomStatus = (room, status) => {
        store[room].status = status;
    }

    isRoomReadyToStart = (room) => {
        //if(store[room].timer) return false;
        let players = getRoomPlayersCount(room);
        return players >= 2;
    }

    chat = (user, message) => {
        const { room } = user;
        let id = getRandomValue() + getRandomValue();
        //console.log(room, id);
        store[room].chat.push({
            id,
            player: user,
            message,
        });
    }

    setWord = (room, word) => {
        store[room].word = word;
    }

    getWord = (room) => {
        return store[room].word;
    }

    setImage = (room, image) => {
        store[room].image = image;
    }

    setWinner = (room, playerId) => {
        store[room].winner = {
            id: playerId,
            nickname: store[room].players[playerId].nickname,
        };
    }

    cleanRoom = (room) => {
        store[room].status = ROOM_STATUS_WAITING;
        store[room].chat = [];
        //store[room].players = {};
        store[room].roomName = room;
        store[room].image = null;
        store[room].words = [];
        store[room].word = null;
        store[room].winner = {};
        store[room].countdown = COUNTDOWN;
        store[room].timer = false;
        store[room].painter = {};
        clearInterval(timers[room]);
    }

    isPlayerPainter = (room, playerId) => {
        // console.log(playerId);
        // console.log(store[room].players);
        // console.log(store[room].players[playerId]);
        //return store[room].players[playerId].isPainter;
        return (store[room].painter || {}).id === playerId;
    }

    messageLikeToggle = (room, id, value) => {
        let chat = store[room].chat;
        let item = chat.find(item => item.id === id);
        item.likeStatus = value;
        //item.isLiked = !item.isLiked;
        store[room].chat = chat;
    }

    isWordGuessed = (room, message) => {
        return message.toLowerCase().indexOf(getWord(room).toLowerCase()) !== -1;
    }

    return {
        getRoomList,
        joinRoom,
        leaveRoom,
        getRoom,
        addRoom,
        getRoomPlayersCount,
        setCountdown,
        resetCountdown,
        getCountdown,
        setTimer,
        isTimerRunning,
        getRoomStatus,
        setRoomStatus,
        isRoomReadyToStart,
        resetRoom,
        isGameRunning,
        chat,
        setWord,
        getWord,
        setImage,
        setWinner,
        cleanRoom,
        isPlayerPainter,
        messageLikeToggle,
        isWordGuessed,
    }

};

module.exports = Store;