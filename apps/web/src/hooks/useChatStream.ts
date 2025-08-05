import { ORPCError } from "@orpc/client";
import { schema } from "@repo/db";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import z from "zod";
import { orpc } from "@/utils/orcp";

const MessagePayloadSchema = schema.MessageSchema.omit({
  createdAt: true,
}).extend({
  createdAt: z.string(),
});
type MessagePayload = z.infer<typeof MessagePayloadSchema>;

export function useChatStream(
  roomId: number,
  userId: number,
  user: {
    id: number;
    username: string;
    avatar?: string;
  }
) {
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iteratorRef = useRef<AsyncGenerator<MessagePayload> | null>(null);
  const isStoppedRef = useRef(false);
  const lastMessageIdRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const isDocumentVisibleRef = useRef(true);

  const cleanup = useCallback(async () => {
    isStoppedRef.current = true;
    if (iteratorRef.current) {
      try {
        await iteratorRef.current.return({});
      } catch (e) {
        console.error("Failed to stop iterator:", e);
      }
      iteratorRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const history = await orpc.chat.getChatHistory.call({
        id: Number(roomId),
      });

      if (isStoppedRef.current) return;

      const formattedMessages = history.data.map((msg) => ({
        ...msg,
        createdAt: msg.createdAt.toISOString(),
      }));

      setMessages(formattedMessages);

      if (history.data.length > 0) {
        lastMessageIdRef.current = history.data[history.data.length - 1].id;
      }
    } catch (err) {
      if (!isStoppedRef.current) {
        console.error("Failed to load history:", err);
        setError("Gagal memuat history chat");
      }
    }
  }, [roomId]);

  // Start stream
  const startStream = useCallback(async () => {
    if (isStoppedRef.current || !isDocumentVisibleRef.current) return;

    try {
      setError(null);

      const iterator = await orpc.chat.streamMessage.call({
        roomId,
        userId,
        username: user.username,
        avatar: user.avatar || null,
        lastMessageId: lastMessageIdRef.current || undefined,
      });

      if (isStoppedRef.current) {
        await iterator.return?.({});
        return;
      }

      iteratorRef.current = iterator as AsyncGenerator<MessagePayload>;
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      for await (const message of iterator) {
        if (isStoppedRef.current) break;

        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;

          lastMessageIdRef.current = message.id;
          return [...prev, message];
        });
      }
    } catch (err) {
      if (!isStoppedRef.current) {
        setIsConnected(false);

        if (err instanceof ORPCError) {
          setError(`Connection error: ${err.message}`);
        } else {
          setError("Koneksi terputus");
        }

        if (
          reconnectAttemptsRef.current < maxReconnectAttempts &&
          isDocumentVisibleRef.current
        ) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(
            1000 * 2 ** (reconnectAttemptsRef.current - 1),
            10000
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isStoppedRef.current && isDocumentVisibleRef.current) {
              startStream();
            }
          }, delay);
        }
      }
    } finally {
      if (!isStoppedRef.current) {
        setIsConnected(false);
      }
    }
  }, [roomId, userId, user]);

  const sendMessageMutation = useMutation(
    orpc.chat.sendMessage.mutationOptions()
  );
  const joinRoomMutation = useMutation(
    orpc.chat.joinPublicRoom.mutationOptions()
  );

  const sendMessage = useCallback(
    async (content: string) => {
      try {
        await sendMessageMutation.mutateAsync({
          roomId,
          userId,
          content,
          type: "TEXT",
          avatar: user.avatar || null,
          username: user.username,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to send message:", err);
        throw new Error("Gagal mengirim pesan");
      }
    },
    [roomId, userId, user, sendMessageMutation]
  );

  // Join room
  const joinRoom = useCallback(async () => {
    try {
      await joinRoomMutation.mutateAsync({
        userId,
        username: user.username,
        avatar: user.avatar || null,
        roomId,
      });
    } catch (err) {
      if (!isStoppedRef.current) {
        console.error("Failed to join room:", err);
      }
    }
  }, [roomId, userId, user, joinRoomMutation]);

  const handleVisibilityChange = useCallback(() => {
    isDocumentVisibleRef.current = !document.hidden;

    if (document.hidden) {
      if (iteratorRef.current) {
        iteratorRef.current.return({}).catch(() => {});
        iteratorRef.current = null;
      }
      setIsConnected(false);
    } else {
      if (!isStoppedRef.current && !iteratorRef.current) {
        reconnectAttemptsRef.current = 0;

        loadHistory().then(() => {
          if (!isStoppedRef.current) {
            startStream();
          }
        });
      }
    }
  }, [loadHistory, startStream]);

  const handleOnline = useCallback(() => {
    if (
      !isStoppedRef.current &&
      !iteratorRef.current &&
      isDocumentVisibleRef.current
    ) {
      reconnectAttemptsRef.current = 0;
      startStream();
    }
  }, [startStream]);

  const handleOffline = useCallback(() => {
    setIsConnected(false);
    setError("Tidak ada koneksi internet");
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleVisibilityChange, handleOnline, handleOffline]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    cleanup();
    const abortController = new AbortController();

    isStoppedRef.current = false;
    lastMessageIdRef.current = null;
    reconnectAttemptsRef.current = 0;
    setMessages([]);
    setError(null);
    setIsLoading(true);
    setIsConnected(false);

    const initRoom = async () => {
      try {
        await joinRoom();
        await loadHistory();

        abortController.abort();

        if (!isStoppedRef.current) {
          setIsLoading(false);
          await startStream();
        }
      } catch (err) {
        if (!isStoppedRef.current) {
          console.error("Failed to initialize room:", err);
          setIsLoading(false);
          setError("Gagal menginisialisasi room");
        }
      }
    };

    initRoom();

    return () => {
      abortController.abort();
      cleanup();
    };
  }, [roomId, userId]);

  const reconnect = useCallback(() => {
    if (!isConnected && !isStoppedRef.current) {
      reconnectAttemptsRef.current = 0;
      startStream();
    }
  }, [isConnected, startStream]);

  const stopStream = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    stopStream,
    reconnect,
    startStream,
  };
}
