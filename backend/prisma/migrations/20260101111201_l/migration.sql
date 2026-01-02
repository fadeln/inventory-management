-- AlterTable
ALTER TABLE "IncomingGoods" ADD COLUMN     "signatureImage" TEXT;

-- AlterTable
ALTER TABLE "OutgoingGoods" ADD COLUMN     "signatureImage" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "signatureImage" TEXT;
