-- AlterTable
ALTER TABLE "ecommerce2"."images" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ecommerce2"."products" ADD COLUMN     "deleted_at" TIMESTAMP(3);
