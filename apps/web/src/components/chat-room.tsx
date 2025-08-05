// components/ChatRoom.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useChatStream } from "../hooks/useChatStream";

interface ChatRoomProps {
  roomId: number;
  currentUser: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export default function ChatRoom({ roomId, currentUser }: ChatRoomProps) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { messages, isConnected, isLoading, error, sendMessage } =
    useChatStream(Number(roomId), Number(currentUser.id), currentUser);

  const scrollToBottom = () => {
    if (messagesContainerRef.current && !isUserScrolling) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setIsUserScrolling(!isAtBottom);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (!isAtBottom) {
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 3000);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <auto-ignore>
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      (lastMessage.userId === currentUser.id || !isUserScrolling)
    ) {
      scrollToBottom();
    }
  }, [messages, currentUser.id, isUserScrolling]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <auto-ignore>
  useEffect(() => {
    setIsUserScrolling(false);

    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    try {
      await sendMessage(messageText.trim());
      setMessageText("");

      setIsUserScrolling(false);
      setTimeout(() => scrollToBottom(), 50);
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Gagal mengirim pesan");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-lg border bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
          <div className="text-gray-600">Memuat chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] flex-col rounded-lg border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-4">
        <h3 className="font-semibold">Room Chat #{roomId}</h3>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-gray-600 text-sm">
            {isConnected ? "Terhubung" : "Terputus"}
          </span>
        </div>
      </div>

      {error && (
        <div className="border-b bg-red-50 p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
        style={{
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Belum ada pesan. Mulai percakapan!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.userId === currentUser.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`group relative max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                    message.userId === currentUser.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.userId !== currentUser.id && (
                    <div className="mb-1 font-medium text-xs opacity-75">
                      {message.username}
                    </div>
                  )}
                  <div className="break-words">{message.content}</div>
                  <div className="mt-1 text-xs opacity-60">
                    {new Date(message.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {isUserScrolling && messages.length > 0 && (
        <div className="-translate-x-1/2 absolute bottom-20 left-1/2">
          <button
            type="button"
            onClick={() => {
              setIsUserScrolling(false);
              scrollToBottom();
            }}
            className="flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-gray-600 text-sm shadow-md hover:bg-gray-50"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            Pesan baru
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="border-t bg-gray-50 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={isConnected ? "Ketik pesan..." : "Menunggu koneksi..."}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            disabled={!isConnected}
            // biome-ignore lint/a11y/noAutofocus: <auto-focus>
            autoFocus
          />
          <button
            type="submit"
            disabled={!isConnected || !messageText.trim()}
            className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Kirim
          </button>
        </div>
      </form>
    </div>
  );
}
