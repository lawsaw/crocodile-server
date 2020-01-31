const TARGET = 'COMMON';

//EMIT
const SOCKET_CLIENT = 'SOCKET_CLIENT';
const SOCKET_MESSAGE = 'SOCKET_MESSAGE';

let CommonActions = function(IO) {

    // validateNickname = (socket, { nickname, onSuccess }) => {
    //
    //     let valid = getNicknameErrors(nickname, socket);
    //     if(valid.status === 'error') {
    //         sendMessage(socket, 'error', valid.message);
    //     } else {
    //         socket.user.nickname = nickname;
    //         if(onSuccess) {
    //             let { action, ...props } = onSuccess;
    //             socket.emit(action, {
    //                 ...props
    //             });
    //         }
    //     }
    // }

    validateNickname2 = (socket, nickname) => {

        let valid = getNicknameErrors(nickname, socket);
        if(valid.status === 'error') {
            sendMessage(socket, 'error', valid.message);
            return false;
        } else {
            socket.user.nickname = nickname;
            return true;
        }
    }

    getNicknameErrors = (nickname, socket) => {
        const MIN_LENGTH = 4;
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
        if(isNicknameInUse(nickname, socket)) {
            return {
                status: 'error',
                message: `This nickname is already in use :)`,
            };
        }
        return {
            status: 'success',
        };
    }

    isNicknameInUse = (nickname, socket) => {
        const sockets = IO.sockets.clients().sockets;
        return Object.keys(sockets).some(sock => sockets[sock].user.nickname === nickname && (socket.user.id !== sockets[sock].user.id));
    }

    sendMessage = (receiver, type, message) => {
        socketEmitCommon(receiver, TARGET, SOCKET_MESSAGE, {
            message_type: type,
            message,
        });
    }

    socketEmitCommon = (receiver, target, action, args) => {
        receiver.emit(SOCKET_CLIENT, {
            target,
            action,
            args
        });
    }

    return {
        actions: {
            sendMessage,
            validateNickname: validateNickname2,
            emit: socketEmitCommon,
        },
    }

};

module.exports = CommonActions;