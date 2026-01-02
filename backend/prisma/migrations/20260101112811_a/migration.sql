-- AlterTable
ALTER TABLE "ItemRequest" ADD COLUMN     "rejectReason" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "rejectReason" TEXT;
