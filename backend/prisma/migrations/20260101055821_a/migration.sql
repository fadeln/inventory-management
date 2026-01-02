/*
  Warnings:

  - You are about to drop the column `createdById` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `PurchaseOrderItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_createdById_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "createdById";

-- AlterTable
ALTER TABLE "PurchaseOrderItem" DROP COLUMN "unitPrice";
