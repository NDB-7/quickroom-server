import rateLimit from "../../middleware/rateLimit.js";
import activeRoomsMap from "../../config/activeRoomsMap.js";
import { z } from "zod";
import { io } from "../../config/server.js";
const messageSchema = z.string().min(1).max(1000);
export default function messageEvent(socket) {
    const id = socket.id;
    socket.on("sendMessage", (messageText, session, callback) => {
        rateLimit(id, callback, () => {
            if (session) {
                const { sessionToUsersMap, messagesCache } = activeRoomsMap.get(session.room);
                if (sessionToUsersMap.has(session.id)) {
                    const { success, data } = messageSchema.safeParse(messageText.trim());
                    if (success) {
                        const name = sessionToUsersMap.get(session.id);
                        console.log(`User ${id} (${name}) said ${data}`);
                        const message = {
                            sender: name,
                            content: data,
                            serverNotification: false,
                            sentAt: Date.now(),
                        };
                        io.to(session.room).emit("receiveMessage", message);
                        message.cache = true;
                        messagesCache.push(message);
                        if (messagesCache.length > 10)
                            messagesCache.shift();
                    }
                }
            }
        });
    });
}
//# sourceMappingURL=messageEvent.js.map