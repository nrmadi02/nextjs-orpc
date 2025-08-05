import { EventPublisher } from "@orpc/server";
import type z from "zod";
import type { MessagePayload } from "../contracts/chat.contract";

const chatPublisher = new EventPublisher<{
  message: z.infer<typeof MessagePayload>;
  "user-joined": {
    roomId: number;
    user: { id: number; name: string; avatar?: string };
  };
  "user-left": {
    roomId: number;
    user: { id: number; name: string };
  };
  "user-count": {
    roomId: number;
    count: number;
  };
}>();

export type ChatPublisherEvent = Parameters<typeof chatPublisher.publish>[0];
export type ChatPublisher = typeof chatPublisher;

const onlineUsers = new Map<number, Set<number>>();
const userSessions = new Map<
  number,
  { username: string; avatar?: string; roomId: number }
>();

const addUserToRoom = (
  roomId: number,
  userId: number,
  username: string,
  avatar?: string
) => {
  const hasOnlineUser = onlineUsers.has(roomId);
  if (!hasOnlineUser) {
    onlineUsers.set(roomId, new Set());
  }

  onlineUsers.get(roomId)?.add(userId);

  userSessions.set(userId, {
    username,
    avatar,
    roomId,
  });

  chatPublisher.publish("user-count", {
    roomId,
    count: onlineUsers.get(roomId)?.size || 0,
  });
};

const removeUserFromRoom = (roomId: number, userId: number) => {
  const room = onlineUsers.get(roomId);
  if (room) {
    room.delete(userId);
    if (room.size === 0) {
      onlineUsers.delete(roomId);
    }
  }

  userSessions.delete(userId);

  chatPublisher.publish("user-count", {
    roomId,
    count: onlineUsers.get(roomId)?.size || 0,
  });
};

export {
  chatPublisher,
  onlineUsers,
  userSessions,
  addUserToRoom,
  removeUserFromRoom,
};
