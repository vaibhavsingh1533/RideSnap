import { io } from "socket.io-client";

const socket = io(import.meta.env.http://localhost:5000, {
  transports: ["websocket"],
  withCredentials: true
});

export default socket;