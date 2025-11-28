// lib/auth.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Collect role names for convenience (['OWNER', 'CASHIER', ...])
  const roleNames = user.roles.map((ur) => ur.role.name);

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      roles: roleNames,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );

  return { user, token };
}