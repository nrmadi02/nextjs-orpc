// app/chat/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import UsernameInput from "@/components/username-input";
import { orpc } from "@/utils/orpc";
import ChatRoom from "../../components/chat-room";

interface AnonymousUser {
  id: string;
  username: string;
  avatar: string;
}

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<AnonymousUser | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [debouncedRoomId, setDebouncedRoomId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("chatUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.id && user.username && user.avatar) {
          setCurrentUser(user);
        } else {
          localStorage.removeItem("chatUser");
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        localStorage.removeItem("chatUser");
      }
    }
  }, []);

  const { data: roomsData, isLoading } = useQuery(
    orpc.chat.getPublicRoom.queryOptions({
      queryKey: ["public-rooms", currentUser?.id],
      enabled: !!currentUser,
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
      staleTime: 5000,
    })
  );

  const handleUserSet = (user: AnonymousUser) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("chatUser");
    setCurrentUser(null);
  };

  const handleRoomSwitch = (roomId: string) => {
    setSelectedRoomId(roomId);

    setTimeout(() => {
      setDebouncedRoomId(roomId);
    }, 300);
  };

  if (!currentUser) {
    return <UsernameInput onUserSet={handleUserSet} />;
  }

  return (
    <div className="container mx-auto max-w-7xl p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">🚀 Anonymous Live Chat</h1>
          <p className="text-gray-600">Chat real-time tanpa registrasi</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
            <Image
              width={32}
              height={32}
              unoptimized
              src={currentUser.avatar}
              alt="Avatar"
              className="h-8 w-8 rounded-full"
            />
            <span className="font-medium">{currentUser.username}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-red-200 px-3 py-2 text-red-600 text-sm transition-colors hover:bg-red-50 hover:text-red-700"
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Room List */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            🏠 Public Rooms
            {isLoading && <span className="text-gray-500 text-sm">⟳</span>}
          </h2>

          <div className="space-y-2">
            {roomsData?.data.map((room) => (
              <button
                type="button"
                key={room.id}
                onClick={() => handleRoomSwitch(room.id.toString())}
                className={`w-full rounded-lg border p-3 text-left transition-all duration-200 ${
                  selectedRoomId === room.id.toString()
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">{room.name}</div>
                <div className="mt-1 text-gray-500 text-xs">
                  {room.description}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-medium text-green-600 text-xs">
                    🟢 {room.onlineCount} online
                  </span>
                  {room.lastMessage && (
                    <div className="text-gray-400 text-xs">
                      {new Date(room.lastMessage.createdAt).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  )}
                </div>
                {room.lastMessage && (
                  <div className="mt-1 truncate text-gray-400 text-xs">
                    💬 {room.lastMessage.username}: {room.lastMessage.content}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Info Panel */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <h3 className="mb-2 flex items-center gap-1 font-medium text-blue-800">
              ℹ️ Cara Menggunakan
            </h3>
            <ul className="space-y-1 text-blue-700 text-xs">
              <li>• Pilih room yang ingin kamu masuki</li>
              <li>• Ketik pesan dan tekan Enter</li>
              <li>• Chat real-time dengan user lain</li>
              <li>• Refresh halaman akan logout otomatis</li>
              <li>• Semua room bersifat publik</li>
            </ul>
          </div>

          {/* Rules Panel */}
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="mb-2 font-medium text-yellow-800">⚠️ Aturan Chat</h3>
            <ul className="space-y-1 text-xs text-yellow-700">
              <li>• Gunakan bahasa yang sopan</li>
              <li>• Jangan spam atau flood</li>
              <li>• Respect semua pengguna</li>
              <li>• No SARA, toxic, atau hate speech</li>
            </ul>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          {selectedRoomId ? (
            currentUser && (
              <ChatRoom
                key={`${debouncedRoomId}-${currentUser.id}`}
                roomId={Number(debouncedRoomId)}
                currentUser={{
                  id: Number(currentUser.id),
                  username: currentUser.username,
                  avatar: currentUser.avatar,
                }}
              />
            )
          ) : (
            <div className="flex h-[600px] items-center justify-center rounded-lg border bg-gray-50">
              <p className="text-gray-500">Pilih room untuk memulai chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
