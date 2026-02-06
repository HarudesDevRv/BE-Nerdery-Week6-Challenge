import { CreateProductDto } from "../dtos/products/create-product-dto";
import { UpdateProductDto } from "../dtos/products/update-product-dto";
import { UpdateProductStatusDto } from "../dtos/products/update-product-status-dto";
import prisma from "../prisma";

export class ProductService {
  static async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  static async getByIdAndClient(id: string, clientId: string) {
    const product = await prisma.product.findFirst({
      where: { id, clientId },
    });
    if (product) {
      const images = await prisma.image.findMany({
        where: { productId: id },
        select: { id: true, url: true },
      });
      return { ...product, images };
    }
    return null;
  }

  static async createProduct(clientId: string, product: CreateProductDto) {
    const user = await prisma.client.findUnique({ where: { id: clientId } });

    if (!user) {
      throw new Error("The client id doesn't refer to an existing client");
    }

    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name, clientId },
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

    const createdProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!createdProduct) {
      throw new Error("The product id doesn't refer to an existing product");
    }

    if (createdProduct.clientId != clientId) {
      throw new Error(
        "The client doesn't have permission to modify that product",
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { ...product },
    });

    const images = await prisma.image.findMany({
      where: { productId },
      select: { id: true, url: true },
    });

    return { ...updatedProduct, images };
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
        url: "",
      },
    });

    return { id: image.id, url: image.url };
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
