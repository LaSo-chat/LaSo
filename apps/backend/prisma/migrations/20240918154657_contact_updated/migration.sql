/*
  Warnings:

  - You are about to drop the column `contactId` on the `Contact` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,receiverId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiverId` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_contactId_fkey";

-- DropIndex
DROP INDEX "Contact_userId_contactId_key";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "contactId",
ADD COLUMN     "receiverId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userId_receiverId_key" ON "Contact"("userId", "receiverId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
