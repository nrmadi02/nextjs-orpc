import { eventIterator, oc } from "@orpc/contract";
import { schema } from "@repo/db";
import z from "zod";
import { baseContract } from "./base.contract";

export const MessageSchema = schema.MessageSchema;
export const RoomSchema = schema.RoomSchema;
export const GetChatHistoryInput = MessageSchema.pick({
  id: true,
});
export const SendMessageInput = MessageSchema.omit({ id: true });
export const StreamMessageInput = MessageSchema.pick({
  roomId: true,
  userId: true,
  username: true,
  avatar: true,
}).extend({
  lastMessageId: z.number().optional(),
});
export const JoinPublicRoomInput = MessageSchema.pick({
  roomId: true,
  userId: true,
  username: true,
  avatar: true,
});
export const LeavePublicRoomInput = JoinPublicRoomInput.pick({
  roomId: true,
  userId: true,
});
export const MessagePayload = schema.MessageSchema.omit({
  createdAt: true,
}).extend({
  createdAt: z.string(),
});

export const chatContract = {
  getChatHistory: oc
    .input(GetChatHistoryInput)
    .output(baseContract(MessageSchema.array())),
  sendMessage: oc.input(SendMessageInput).output(baseContract(MessageSchema)),
  streamMessage: oc
    .input(StreamMessageInput)
    .output(eventIterator(MessagePayload)),
  getPublicRoom: oc.output(
    baseContract(
      RoomSchema.extend({
        onlineCount: z.number(),
        lastMessage: MessagePayload,
      }).array()
    )
  ),
  joinPublicRoom: oc.input(JoinPublicRoomInput).output(
    baseContract(
      z.object({
        success: z.boolean(),
      })
    )
  ),
  leavePublicRoom: oc.input(LeavePublicRoomInput).output(
    baseContract(
      z.object({
        success: z.boolean(),
      })
    )
  ),
};
