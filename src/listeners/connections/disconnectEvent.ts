import { Socket } from "socket.io";
import activeRoomsMap from "../../config/activeRoomsMap.js";
import { rateLimitMap } from "../../middleware/rateLimit.js";
import updateUserListForClients from "../../rooms/updateUserListForClients.js";
import { ServerMessageType } from "../../types.js";
import { io } from "../../index.js";
export default function disconnectEvent(socket: Socket) {
  const id = socket.id;

  socket.on("disconnect", () => {
    let code: string;

    activeRoomsMap.forEach((room, roomCode) => {
      if (room.activeSessionsMap.has(id)) {
        code = roomCode;
      }
    });

    rateLimitMap.delete(id);

    if (code) {
      const { sessionToUsersMap, activeSessionsMap } = activeRoomsMap.get(code);

      const sessionId = activeSessionsMap.get(id);
      const name = sessionToUsersMap.get(sessionId);
      console.log(`User ${id} (${name}) disconnected.`);
      activeSessionsMap.delete(id);
      updateUserListForClients(code);
      const message: ServerMessageType = {
        content: `${name} left the chatroom.`,
        serverNotification: true,
      };
      io.to(code).emit("receiveMessage", message);
    } else console.log(`User ${id} disconnected.`);
  });
}