import { CreateProductDto } from "../dtos/products/create-product-dto";
import { UpdateProductDto } from "../dtos/products/update-product-dto";
import { UpdateProductStatusDto } from "../dtos/products/update-product-status-dto";
import prisma from "../prisma";
import { formatProduct } from "../utils/product-utilities";
import { ProductPaginationInput } from "../utils/product.types";

export class ProductService {
  static async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  static async getByIdAndClient(id: string, clientId: string) {
    const product = await prisma.product.findFirst({
      include: {
        images: {
          select: { id: true, url: true },
          where: { url: { not: null }, deletedAt: null },
        },
      },
      where: { id, clientId, deletedAt: null },
    });
    console.log(product);
    return product;
  }

  static async getByClient(
    clientId: string,
    paginationInput: ProductPaginationInput | undefined,
  ) {
    const user = await prisma.client.findUnique({ where: { id: clientId } });

    if (!user) {
      throw new Error("The client id doesn't refer to an existing client");
    }

    const page = paginationInput?.page || 1;
    const limit = paginationInput?.limit || 10;

    const productCount = await prisma.product.count();
    const products = await prisma.product.findMany({
      include: {
        images: {
          select: { id: true, url: true },
          where: { url: { not: null }, deletedAt: null },
        },
      },
      where: { clientId, deletedAt: null },
      take: paginationInput?.limit || 10,
      skip: paginationInput?.page
        ? (paginationInput.page - 1) * (paginationInput.limit || 10)
        : undefined,
    });
    const pagination = {
      page,
      limit,
      hasNext: productCount > page * limit,
    };
    return { products, pagination };
  }

  static async createProduct(clientId: string, product: CreateProductDto) {
    const user = await prisma.client.findUnique({ where: { id: clientId } });

    if (!user) {
      throw new Error("The client id doesn't refer to an existing client");
    }

    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name, clientId, deletedAt: null },
    });

    if (existingProduct) {
      throw new Error(
        "A product with that name was already created by the client",
      );
    }

    const createdProduct = await prisma.product.create({
      data: { ...product, clientId },
    });

    return { ...createdProduct, images: [] };
  }

  static async updateProduct(
    productId: string,
    clientId: string,
    product: UpdateProductDto | UpdateProductStatusDto,
  ) {
    const user = await prisma.client.findUnique({ where: { id: clientId } });

    if (!user) {
      throw new Error("The client id doesn't refer to an existing client");
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { ...product },
      include: {
        images: {
          select: { url: true, id: true },
          where: { url: { not: null } },
        },
      },
    });

    if (!updatedProduct) {
      throw new Error(
        "The product id doesn't refer to an existing client product",
      );
    }

    return updatedProduct;
  }

  static async deleteProduct(productId: string, clientId: string) {
    const user = await prisma.client.findUnique({ where: { id: clientId } });

    if (!user) {
      throw new Error("The client id doesn't refer to an existing client");
    }

    const deletedProduct = await prisma.product.update({
      where: { id: productId, deletedAt: null, clientId },
      data: { deletedAt: Date() },
    });

    if (!deletedProduct) {
      throw new Error(
        "The product Id doesn't refer to an existing client product",
      );
    }

    return deletedProduct;
  }

  static async createImage(clientId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("The product id doesn't refer to an existing product");
    }

    if (product.clientId != clientId) {
      throw new Error(
        "The client doesn't have permission to modify that product",
      );
    }

    const image = await prisma.image.create({
      data: {
        productId: productId,
      },
      select: { id: true, url: true },
    });

    return image;
  }

  static async setImageUrl(imageId: string, imageUrl: string) {
    const image = await prisma.image.update({
      where: {
        id: imageId,
      },
      data: {
        url: imageUrl,
      },
    });
    if (!image) throw new Error("Image not found");
    return { id: image.id, url: image.url };
  }

  static async deleteFailedImage(imageId: string) {
    const image = await prisma.image.delete({
      where: {
        id: imageId,
      },
    });
    if (!image) {
      throw new Error("Image not found");
    }
    return image.id;
  }
}
