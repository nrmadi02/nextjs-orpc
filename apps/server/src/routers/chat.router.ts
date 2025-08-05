import { withEventMeta } from "@orpc/server";
import { chatContract } from "../contracts/chat.contract";
import {
  chatPublisher,
  removeUserFromRoom,
  userSessions,
} from "../event/chat-publisher.event";
import { createResponse, implementRouter } from "../lib/orpc";
import secureMiddleware from "../middleware/secure.middleware";
import { ChatService } from "../services/chat.service";

const os = implementRouter(chatContract).use(secureMiddleware);

export const chatRouter = os.router({
  getChatHistory: os.getChatHistory.handler(async ({ context, input }) => {
    const chatService = new ChatService(context, chatPublisher);
    const chatHistory = await chatService.getHistory(input.id);

    return createResponse("Success, get chat history", chatHistory);
  }),
  sendMessage: os.sendMessage.handler(async ({ context, input }) => {
    const chatService = new ChatService(context, chatPublisher);
    const message = await chatService.sendMessage(input);

    return createResponse("Success, send message", message);
  }),
  streamMessage: os.streamMessage.handler(async function* ({
    context,
    input,
    signal,
  }) {
    const chatService = new ChatService(context, chatPublisher);

    try {
      const messages = await chatService.streamMessage(input);

      if (input.lastMessageId) {
        for (const message of messages) {
          yield withEventMeta(
            {
              ...message,
            },
            {
              id: message.id.toString(),
            }
          );
        }
      }

      for await (const message of chatPublisher.subscribe("message", {
        signal,
      })) {
        if (message.roomId === input.roomId) {
          yield withEventMeta(message, { id: message.id.toString() });
        }
      }
    } finally {
      removeUserFromRoom(input.roomId, input.userId);

      const userSession = userSessions.get(input.userId);
      if (userSession) {
        chatPublisher.publish("user-left", {
          roomId: input.roomId,
          user: { id: input.userId, name: userSession.username },
        });
      }

      console.log(
        `Anonymous user ${userSession?.username} (${input.userId}) disconnected from room ${input.roomId}`
      );
    }
  }),
  getPublicRoom: os.getPublicRoom.handler(async ({ context }) => {
    const chatService = new ChatService(context, chatPublisher);
    const publicRoom = await chatService.getPublicRoom();

    return createResponse("Success, get public room", publicRoom);
  }),
  joinPublicRoom: os.joinPublicRoom.handler(async ({ context, input }) => {
    const chatService = new ChatService(context, chatPublisher);
    const joinPublicRoom = await chatService.joinRoom(input);

    return createResponse("Success, join public room", joinPublicRoom);
  }),
  leavePublicRoom: os.leavePublicRoom.handler(async ({ context, input }) => {
    const chatService = new ChatService(context, chatPublisher);
    const leavePublicRoom = await chatService.leaveRoom(input);

    return createResponse("Success, leave public room", leavePublicRoom);
  }),
});
