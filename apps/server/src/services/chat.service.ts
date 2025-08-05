import type { schema } from "@repo/db";
import type { z } from "zod";
import type { MessagePayload } from "./../contracts/chat.contract";
import type {
  JoinPublicRoomInput,
  LeavePublicRoomInput,
  MessageSchema,
  StreamMessageInput,
} from "../contracts/chat.contract";
import {
  addUserToRoom,
  type ChatPublisher,
  onlineUsers,
  removeUserFromRoom,
} from "../event/chat-publisher.event";
import type { Context } from "../lib/context";

type Message = z.infer<typeof MessageSchema>;
type MessageCreateData = Omit<Message, "id" | "createdAt" | "updatedAt">;
type StreamMessageCreateData = z.infer<typeof StreamMessageInput>;
type JoinRoom = z.infer<typeof JoinPublicRoomInput>;
type LeaveRoom = z.infer<typeof LeavePublicRoomInput>;
type PublicRoom = z.infer<typeof schema.RoomSchema> & {
  onlineCount: number;
  lastMessage: z.infer<typeof MessagePayload>;
};

export class ChatService {
  constructor(private context: Context, private chatPublisher: ChatPublisher) {}

  async getHistory(roomId: number): Promise<Message[]> {
    return this.context.db.message.findMany({
      where: {
        roomId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async sendMessage(data: MessageCreateData): Promise<Message> {
    const message = await this.context.db.message.create({
      data,
    });

    const messagePayload: z.infer<typeof MessagePayload> = {
      id: message.id,
      roomId: message.roomId,
      userId: message.userId,
      username: message.username,
      avatar: message.avatar,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      type: message.type,
    };

    this.chatPublisher.publish("message", messagePayload);

    return message;
  }

  async streamMessage(
    data: StreamMessageCreateData
  ): Promise<Array<z.infer<typeof MessagePayload>>> {
    const { roomId, userId, username, avatar, lastMessageId } = data;
    addUserToRoom(roomId, userId, username, avatar || undefined);

    this.chatPublisher.publish("user-joined", {
      roomId,
      user: {
        id: data.userId,
        name: data.username,
        avatar: data.avatar || undefined,
      },
    });

    if (lastMessageId) {
      const missedMessages = await this.context.db.message.findMany({
        where: {
          roomId,
          createdAt: {
            gt: await this.context.db.message
              .findUnique({ where: { id: lastMessageId } })
              .then((msg) => msg?.createdAt || new Date(0)),
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return missedMessages.map((msg) => ({
        id: msg.id,
        roomId: msg.roomId,
        userId: msg.userId,
        username: msg.username,
        avatar: msg.avatar,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
        type: msg.type,
      }));
    }

    return [];
  }

  async getPublicRoom(): Promise<PublicRoom[]> {
    const rooms = await this.context.db.room.findMany({
      where: {
        isPrivate: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return rooms.map((room) => ({
      ...room,
      onlineCount: onlineUsers.get(room.id)?.size || 0,
      lastMessage: {
        ...room.messages[0],
        createdAt: room.messages[0].createdAt.toISOString(),
      },
    }));
  }

  async joinRoom(data: JoinRoom): Promise<{
    success: boolean;
  }> {
    const room = await this.context.db.room.findUnique({
      where: {
        id: data.roomId,
      },
    });
    if (!room) {
      return {
        success: false,
      };
    }
    addUserToRoom(
      room.id,
      data.userId,
      data.username,
      data.avatar || undefined
    );

    return {
      success: true,
    };
  }

  async leaveRoom(data: LeaveRoom): Promise<{
    success: boolean;
  }> {
    removeUserFromRoom(data.roomId, data.userId);
    return {
      success: true,
    };
  }
}
