/*
  Warnings:

  - Added the required column `referenceNumber` to the `IncomingGoods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IncomingGoods" ADD COLUMN     "referenceNumber" TEXT NOT NULL;
