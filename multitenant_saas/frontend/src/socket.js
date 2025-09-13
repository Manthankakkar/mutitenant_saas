// frontend/src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // backend server
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

export default socket;
