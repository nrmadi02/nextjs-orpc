"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface UsernameInputProps {
  onUserSet: (user: { id: string; username: string; avatar: string }) => void;
}

// Daftar avatar random menggunakan DiceBear API
const AVATAR_STYLES = [
  "avataaars",
  "bottts",
  "identicon",
  "initials",
  "miniavs",
  "open-peeps",
  "personas",
  "pixel-art",
];

const generateAvatarUrl = (seed: string, style = "avataaars") => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
};

export default function UsernameInput({ onUserSet }: UsernameInputProps) {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(() =>
    generateAvatarUrl("default", "avataaars")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <on mount>
  useEffect(() => {
    generateRandomAvatar();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) return;

    setIsSubmitting(true);

    try {
      // Generate unique user ID
      const timestamp = Date.now();
      const userId = `${timestamp}`;

      const user = {
        id: userId,
        username: username.trim(),
        avatar: selectedAvatar,
      };

      // Simpan ke localStorage untuk persist session
      localStorage.setItem("chatUser", JSON.stringify(user));

      onUserSet(user);
    } catch (err) {
      console.error("Error setting user:", err);
      alert("Gagal masuk chat. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomAvatar = () => {
    const randomStyle =
      AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    const randomSeed = Math.random().toString(36) + Date.now();
    setSelectedAvatar(generateAvatarUrl(randomSeed, randomStyle));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow letters, numbers, spaces, and common symbols
    const sanitized = value.replace(/[^a-zA-Z0-9\s._-]/g, "");
    setUsername(sanitized);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-bold text-3xl text-gray-800">
            🚀 Anonymous Chat
          </h1>
          <p className="text-gray-600">
            Masuk tanpa registrasi, langsung chat!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div className="text-center">
            <label
              htmlFor="avatar"
              className="mb-3 block font-medium text-gray-700 text-sm"
            >
              Pilih Avatar Kamu
            </label>
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <Image
                  src={selectedAvatar}
                  unoptimized
                  alt="Avatar"
                  width={100}
                  height={100}
                  className="h-24 w-24 rounded-full border-4 border-blue-200 bg-white shadow-md"
                  onError={(e) => {
                    // Fallback jika avatar gagal load
                    const target = e.target as HTMLImageElement;
                    target.src = generateAvatarUrl("fallback", "initials");
                  }}
                />
                <button
                  type="button"
                  onClick={generateRandomAvatar}
                  className="-bottom-2 -right-2 absolute rounded-full bg-blue-500 p-2 text-white shadow-lg transition-colors hover:bg-blue-600"
                  title="Ganti avatar random"
                >
                  🎲
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={generateRandomAvatar}
              className="text-blue-600 text-sm underline hover:text-blue-700"
            >
              Ganti Avatar Random
            </button>
          </div>

          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block font-medium text-gray-700 text-sm"
            >
              Nama yang Akan Ditampilkan
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Contoh: JohnDoe123"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={25}
              minLength={2}
              required
            />
            <div className="mt-1 flex justify-between">
              <p className="text-gray-500 text-xs">
                2-25 karakter, huruf, angka, spasi
              </p>
              <p className="text-gray-400 text-xs">{username.length}/25</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!username.trim() || username.length < 2 || isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⟳</span>
                Masuk...
              </span>
            ) : (
              "Masuk Chat 🚀"
            )}
          </button>
        </form>

        {/* Info Panel */}
        <div className="mt-8 rounded-lg border bg-gray-50 p-4">
          <h3 className="mb-2 flex items-center gap-1 font-medium text-gray-800">
            💡 Yang Perlu Kamu Tahu
          </h3>
          <ul className="space-y-1 text-gray-600 text-sm">
            <li>• Tidak perlu email atau password</li>
            <li>• Semua room bersifat publik</li>
            <li>• Chat tersimpan selama session</li>
            <li>• Refresh halaman = logout otomatis</li>
            <li>• Gunakan nama yang sopan</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            Powered by oRPC + Next.js + Prisma
          </p>
        </div>
      </div>
    </div>
  );
}
