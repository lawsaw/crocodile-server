const INITIAL_ROOM = {
    chat: [],
    players: {},
    roomName: 'Default name',
    image: '',
};

const COUNTDOWN = 10;


const ROOM_STATUS_PAINTER_SELECTING = 'PAINTER_SELECTING';
const ROOM_STATUS_WORD_SELECTING = 'WORD_SELECTING';
const ROOM_STATUS_DRAWING = 'DRAWING';
const ROOM_STATUS_WAITING = 'WAITING';
const ROOM_STATUS_GAME_FINISHED = 'FINISHED';

const DEFAULT_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAGQCAYAAAByNR6YAAAT1ElEQVR4Xu3WMREAAAgDMerfNCZ+DAI65Bh+5wgQIECAAAECBFKBpWvGCBAgQIAAAQIETmB5AgIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQEFh+gAABAgQIECAQCwisGNQcAQIECBAgQEBg+QECBAgQIECAQCwgsGJQcwQIECBAgAABgeUHCBAgQIAAAQKxgMCKQc0RIECAAAECBASWHyBAgAABAgQIxAICKwY1R4AAAQIECBAQWH6AAAECBAgQIBALCKwY1BwBAgQIECBAQGD5AQIECBAgQIBALCCwYlBzBAgQIECAAAGB5QcIECBAgAABArGAwIpBzREgQIAAAQIEBJYfIECAAAECBAjEAgIrBjVHgAABAgQIEBBYfoAAAQIECBAgEAsIrBjUHAECBAgQIEBAYPkBAgQIECBAgEAsILBiUHMECBAgQIAAAYHlBwgQIECAAAECsYDAikHNESBAgAABAgQElh8gQIAAAQIECMQCAisGNUeAAAECBAgQeJDfAZGJuGy/AAAAAElFTkSuQmCC';

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

    getRandomWordList = (count=3, arr=[]) => {
        if(arr.length < count) {
            let word = words[Math.ceil(Math.random() * words.length-1)];
            if(!arr.includes(word)) arr.push(word);
            return getRandomWordList(count, arr);
        }
        else return arr;
    }

    roomList = () => {
        return Object.keys(store).map(room => ({
            room,
            players: Object.keys(store[room].players).length,
        }));
    }

    addRoom = (room) => {
        store[room] = {
            status: ROOM_STATUS_WAITING,
            chat: [],
            players: {},
            roomName: room,
            image: null,
            words: [],
            word: null,
            winner: null,
            countdown: COUNTDOWN,
            timer: null,
        };
    }

    isRoomExist = (room) => {
        return store[room] ? true : false;
    }

    getRoom = (room) => {
        return store[room];
    }

    joinRoom = (user, room) => {
        const { id, ...userProps } = user;
        store[room].players[id] = userProps;
    }

    leaveRoom = (userId, room) => {
        delete store[room].players[userId];
    }

    isTimerRunning = (room) => {
        return store[room].timer !== null;
    }

    kickUser = (userId) => {

    }

    getStore = () => {
        return store;
    }

    getChat = (room) => {
        return store[room].chat;
    }

    updateChat = (room, { id, message }) => {
        store[room].chat.push({
            id,
            player: store[room].players[id],
            message,
        })
    }

    resetPainter = (room) => {
        for(let player in store[room].players) {
            store[room].players[player]['isPainter'] = false;
        }
    }

    setRandomPainter = (room) => {
        resetPainter(room);
        let arrayOfIds = Object.keys(store[room].players);
        let randomId = Math.ceil(Math.random() * arrayOfIds.length-1);
        let playerId = arrayOfIds[randomId];
        // console.log('-----');
        // console.log('-----');
        // console.log('-----');
        // console.log(arrayOfIds);
        // console.log('-----');
        // console.log(randomId);
        // console.log('-----');
        // console.log(playerId);
        // console.log('-----');
        // console.log('-----');
        // console.log('-----');
        store[room].players[playerId].isPainter = true;
        store[room].players[playerId].words = getRandomWordList();
    }

    resetPlayers = (room) => {
        let players = store[room].players;
        for(let player in players) {
            store[room].players[player].isPainter = false;
        }
    }

    updateImage = (room, image) => {
        store[room].image = image;
    }

    cleanRoom = (room) => {
        setRoomStatus(room, ROOM_STATUS_WAITING);
        store[room].chat = [];
        store[room].image = null;
        store[room].words = [];
        store[room].word = null;
        store[room].winner = null;
        store[room].countdown = COUNTDOWN;
        store[room].timer = null;
        resetPlayers(room);
    }

    getRoomWord = (room) => {
        return store[room].word;
    }

    getRoomStatus = (room) => {
        return store[room].status;
    }

    setRoomStatus = (room, status) => {
        store[room].status = status;
        //if(status === ROOM_STATUS_PAINTER_SELECTING) cleanRoom(room);
    }

    setWord = (room, word) => {
        store[room].word = word;
    }

    setTimer = (room, timer) => {
        store[room].timer = timer;
    }

    getTimer = (room) => {
        return store[room].timer;
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

    setWinner = (room, playerId) => {
        store[room].winner = {
            id: playerId,
            nickname: store[room].players[playerId].nickname,
        };
    }

    getRoomPlayersCount = (room) => {
        return Object.keys(store[room].players).length;
    }

    return {
        roomList,
        addRoom,
        isRoomExist,
        getRoom,
        joinRoom,
        leaveRoom,
        getStore,
        updateChat,
        setRandomPainter,
        updateImage,
        cleanRoom,
        setWord,
        setRoomStatus,
        getRoomWord,
        getRoomStatus,
        setWinner,
        getRoomPlayersCount,
        setTimer,
        getTimer,
        setCountdown,
        getCountdown,
        isTimerRunning,
        getChat,
        resetCountdown,
    }

};

module.exports = Store;