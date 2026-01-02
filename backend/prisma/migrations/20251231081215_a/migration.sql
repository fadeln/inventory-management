/*
  Warnings:

  - You are about to drop the column `requestedById` on the `ItemRequest` table. All the data in the column will be lost.
  - Added the required column `requestedBy` to the `ItemRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ItemRequest" DROP CONSTRAINT "ItemRequest_requestedById_fkey";

-- AlterTable
ALTER TABLE "ItemRequest" DROP COLUMN "requestedById",
ADD COLUMN     "department" TEXT,
ADD COLUMN     "requestedBy" TEXT NOT NULL,
ADD COLUMN     "requiredDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
