-- CreateTable
CREATE TABLE "ecommerce2"."images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "images_url_key" ON "ecommerce2"."images"("url");

-- AddForeignKey
ALTER TABLE "ecommerce2"."images" ADD CONSTRAINT "images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ecommerce2"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
