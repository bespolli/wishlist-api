-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AlterTable: FIRST ADD COLUMN with NULL, then DELETE NULLs, then SET NOT NULL
ALTER TABLE "Wish" ADD COLUMN "userId" TEXT;

-- DELETE rows with NULL userId to satisfy NOT NULL constraint
DELETE FROM "Wish" WHERE "userId" IS NULL;

-- NOW DROP NOT NULL constraint
ALTER TABLE "Wish" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
