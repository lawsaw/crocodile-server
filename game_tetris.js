const TARGET = 'GAME_TETRIS';

//EMIT
const LOBBY_UPDATE_CONFIG = 'LOBBY_UPDATE_CONFIG';
const ON_GAME = 'ON_GAME';

//LISTEN
const MAKE_CONNECTION = 'MAKE_CONNECTION';
const VALIDATE_NICKNAME = 'VALIDATE_NICKNAME';
const SEND_MOVE = 'SEND_MOVE';

//LOBBY STEPS
//const LOBBY_STEP_NICKNAME = 'LOBBY_STEP_NICKNAME';
const LOBBY_STEP_TYPE_SELECTING = 'LOBBY_STEP_TYPE_SELECTING';
//const LOBBY_STEP_CONNECTION = 'LOBBY_STEP_CONNECTION';

let GameTetris = function(IO, common) {

    socketEmitTetris = (receiver, action, args) => {
        common.emit(receiver, TARGET, action, args);
    }

    onClientConnect = (socket, { server_id }) => {
        const sockets = IO.sockets.clients().sockets;
        let server = Object.keys(sockets).find(sock => sockets[sock].id === server_id);
        if(!server) {
            common.sendMessage(socket, 'error', `User with id ${server_id} is not found!`);
        } else if(socket.id === server_id) {
            common.sendMessage(socket, 'error', `You can't play against yourself!`);
        } else {
            initGame(socket.id, server_id);
        }
    }

    initGame = (client1, client2) => {
        const sockets = IO.sockets.clients().sockets;
        sockets[client1].user.opponent = {
            id: sockets[client2].user.id,
            nickname: sockets[client2].user.nickname,
        };
        sockets[client2].user.opponent = {
            id: sockets[client1].user.id,
            nickname: sockets[client1].user.nickname,
        };
        socketEmitTetris(IO.to(client1), ON_GAME, {
            ...sockets[client1].user.opponent,
        });
        socketEmitTetris(IO.to(client2), ON_GAME, {
            ...sockets[client2].user.opponent,
        });
    }

    sendMove = (socket, data) => {
        let opponent = socket.user.opponent.id;
        socketEmitTetris(IO.to(opponent), ON_GAME, {
            ...data
        });
    }

    validateNickname = (socket, { nickname }) => {
        if(common.validateNickname(socket, nickname)) {
            socketEmitTetris(socket, LOBBY_UPDATE_CONFIG, {
                step: LOBBY_STEP_TYPE_SELECTING,
            });
        }
    }

    return {
        [MAKE_CONNECTION]:      onClientConnect,
        [SEND_MOVE]:            sendMove,
        [VALIDATE_NICKNAME]:    validateNickname,
    }

};

module.exports = GameTetris;