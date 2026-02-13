-- AlterTable
ALTER TABLE "ecommerce2"."products" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "description" SET DEFAULT '';
