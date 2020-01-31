const APP = require('express')();
const SERVER = require('http').createServer(APP);
const IO = require('socket.io')(SERVER);
const PORT = process.env.PORT || 3005;

const ROOM_LOBBY = 'LOBBY';
const SOCKET_CLIENT = 'SOCKET_CLIENT';

const COMMON = 'COMMON';
const GAME_CROCODILE = 'GAME_CROCODILE';
const GAME_TETRIS = 'GAME_TETRIS';

const Common = require('./common_actions');
const Crocodile = require('./game_crocodile');
const Tetris = require('./game_tetris');

let common_action = new Common(IO);

const DO_ACTION = {
    [COMMON]:         common_action,
    [GAME_CROCODILE]: new Crocodile(IO, common_action.actions),
    [GAME_TETRIS]:    new Tetris(IO, common_action.actions),
};

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
    DO_ACTION[GAME_CROCODILE]['LEAVE_ROOM'](socket);
    //DO_ACTION[GAME_TETRIS]['SOCKET_ON_GAME_EXIT'](socket);
}

IO.on('connection', socket => {

    onConnected(socket);

    socket.on('disconnect', () => {
        onDisconnected(socket);
    });

    socket.on(SOCKET_CLIENT, ({ type, action, meta, ...request }) => {
        if(type in DO_ACTION && action in DO_ACTION[type]) {
            DO_ACTION[type][action](socket, {...request});
        }
    });


});

SERVER.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
