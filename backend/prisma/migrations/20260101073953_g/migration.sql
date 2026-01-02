/*
  Warnings:

  - The values [pending,approved,rejected,fulfilled] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,approved,rejected,completed] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('DRAFT', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."ItemRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ItemRequest" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "public"."RequestStatus_old";
ALTER TABLE "ItemRequest" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('DRAFT', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."IncomingGoods" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."OutgoingGoods" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."PurchaseOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "IncomingGoods" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TABLE "OutgoingGoods" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "public"."TransactionStatus_old";
ALTER TABLE "IncomingGoods" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "OutgoingGoods" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "IncomingGoods" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "ItemRequest" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "OutgoingGoods" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
