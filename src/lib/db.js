// src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // In development, reuse the same client across hot reloads
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["error", "warn"],
    });
  }
  prisma = global.prisma;
}

export default prisma;  // IMPORTANT: default export