import { prisma } from "../src";

async function main() {
  const defaultRooms = [
    {
      id: 1,
      name: "💬 General",
      description: "Chat umum untuk semua topik",
    },
    {
      id: 2,
      name: "🎮 Gaming",
      description: "Diskusi tentang game dan gaming",
    },
    {
      id: 3,
      name: "💻 Technology",
      description: "Bahasan teknologi dan programming",
    },
    {
      id: 4,
      name: "🎲 Random",
      description: "Chat random dan santai",
    },
    {
      id: 5,
      name: "🇮🇩 Indonesian",
      description: "Chat dalam bahasa Indonesia",
    },
  ];

  console.log("🌱 Seeding default rooms...");

  for (const room of defaultRooms) {
    const createdRoom = await prisma.room.upsert({
      where: { id: room.id },
      update: {},
      create: {
        id: room.id,
        name: room.name,
        description: room.description,
        isPrivate: false,
      },
    });
    console.log(`✅ Room "${createdRoom.name}" ready`);
  }

  // Add some sample messages to make rooms look active
  const sampleMessages = [
    {
      roomId: 1,
      userId: 1,
      username: "🤖 ChatBot",
      content:
        "Selamat datang di room General! Mulai percakapan dengan pengguna lain.",
      type: "SYSTEM" as const,
    },
    {
      roomId: 2,
      userId: 1,
      username: "🤖 GameBot",
      content: "Diskusikan game favorit kalian di sini! 🎮",
      type: "SYSTEM" as const,
    },
    {
      roomId: 3,
      userId: 1,
      username: "🤖 TechBot",
      content: "Share knowledge dan diskusi teknologi terbaru! 💻",
      type: "SYSTEM" as const,
    },
    {
      roomId: 4,
      userId: 1,
      username: "🤖 RandomBot",
      content: "Room untuk ngobrol santai tentang apa saja! 🎲",
      type: "SYSTEM" as const,
    },
    {
      roomId: 5,
      userId: 1,
      username: "🤖 IndoBot",
      content: "Mari berbincang dalam bahasa Indonesia! 🇮🇩",
      type: "SYSTEM" as const,
    },
  ];

  console.log("💬 Adding welcome messages...");

  for (const msg of sampleMessages) {
    await prisma.message.create({
      data: msg,
    });
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
