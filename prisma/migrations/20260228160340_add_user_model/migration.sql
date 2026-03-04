-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Add userId as nullable first
ALTER TABLE "Wish" ADD COLUMN "userId" TEXT;

-- Create a default admin user to own existing wishes
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt")
VALUES (
    'default-admin-00000000-0000-0000',
    'admin@wishlist.com',
    '$2b$10$Gh5uZN3VerxxqCpYi4GeJu4aUKFvkiDUGboOOgWqY7a806ElMBVla',
    'Admin',
    'ADMIN',
    NOW(),
    NOW()
);

-- Assign all existing wishes to the default user
UPDATE "Wish" SET "userId" = 'default-admin-00000000-0000-0000' WHERE "userId" IS NULL;

-- Now make userId NOT NULL
ALTER TABLE "Wish" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
