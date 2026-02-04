import {
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStatusDto,
} from "../dtos/products/product.dto";
import prisma from "../prisma";

export class ProductService {
  static async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  static async getByIdAndClient(id: string, clientId: string) {
    return prisma.product.findFirst({
      where: { id, clientId },
    });
  }

  static async createProduct(clientId: string, product: CreateProductDto) {
    const user = await prisma.client.findUnique({ where: { id: clientId } });

    if (!user) {
      throw new Error("The client id doesn't refer to an existing client");
    }

    const createdProduct = await prisma.product.findFirst({
      where: { name: product.name, clientId },
    });

    if (createdProduct) {
      throw new Error(
        "A product with that name was already created by the client",
      );
    }

    return prisma.product.create({ data: { ...product, clientId } });
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

    const createdProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!createdProduct) {
      throw new Error("The product Id doesn't refer to an existing product");
    }

    if (createdProduct.clientId != clientId) {
      throw new Error(
        "The client doesn't have permission to modify that product",
      );
    }

    return prisma.product.update({
      where: { id: productId },
      data: { ...product },
    });
  }

  static async deleteProduct(productId: string, clientId: string) {
    const user = await prisma.client.findUnique({ where: { id: clientId } });

    if (!user) {
      throw new Error("The client id doesn't refer to an existing client");
    }

    const createdProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!createdProduct) {
      throw new Error("The product Id doesn't refer to an existing product");
    }

    if (createdProduct.clientId != clientId) {
      throw new Error(
        "The client doesn't have permission to modify that product",
      );
    }

    return prisma.product.delete({ where: { id: productId } });
  }
}
