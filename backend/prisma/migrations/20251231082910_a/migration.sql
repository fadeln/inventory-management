/*
  Warnings:

  - You are about to drop the column `quantity` on the `ItemRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ItemRequest" DROP CONSTRAINT "ItemRequest_itemId_fkey";

-- AlterTable
ALTER TABLE "ItemRequest" DROP COLUMN "quantity",
ALTER COLUMN "requestedBy" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ItemRequestItem" (
    "id" TEXT NOT NULL,
    "itemRequestId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ItemRequestItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemRequestItem" ADD CONSTRAINT "ItemRequestItem_itemRequestId_fkey" FOREIGN KEY ("itemRequestId") REFERENCES "ItemRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemRequestItem" ADD CONSTRAINT "ItemRequestItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
