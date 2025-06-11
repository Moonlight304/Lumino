import { io } from "socket.io-client";

const server_url = import.meta.env.VITE_server_url;


export function socketConnection(globalUserID) {

    return io(server_url, {
        auth: { userID: globalUserID }
    });
}