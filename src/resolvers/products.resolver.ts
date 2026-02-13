import { gql } from "apollo-server-express";
import { ProductService } from "../services/products.service";
import { ApiKeyService } from "../services/api-key.service";
import { validateDto } from "../utils/validations";
import { readFileSync } from "fs";

import { formatProduct } from "../utils/product-utilities";
import { CreateProductDto } from "../dtos/products/create-product-dto";
import { UpdateProductDto } from "../dtos/products/update-product-dto";
import { ImageUploadService } from "../services/image-upload.service";
import { FileUpload } from "graphql-upload/processRequest.mjs";
import {
  CreateProductInput,
  GraphQlImage,
  ProductPaginationInput,
  UpdateProductInput,
} from "../utils/product.types";

// GraphQL typeDefs
export const typeDefs = readFileSync("./src/schemas/schema.gql", "utf-8");

// Resolvers
export const resolvers = {
  Query: {
    async getProductById(_: any, args: { id: string }, context: any) {
      const apiKey = context.apiKey;

      if (!apiKey) {
        throw new Error("Missing or invalid API key");
      }

      const product = await ProductService.getByIdAndClient(
        args.id,
        apiKey.clientId,
      );

      if (!product) {
        throw new Error("Product not found for this client or does not exist");
      }

      return formatProduct(product);
    },
    async getProducts(
      _: any,
      args: { pagination: ProductPaginationInput | undefined },
      context: any,
    ) {
      const apiKey = context.apiKey;

      if (!apiKey) {
        throw new Error("Missing or invalid API key");
      }

      try {
        const { products, pagination } = await ProductService.getByClient(
          apiKey.clientId,
          args.pagination,
        );

        return {
          products: products.map(formatProduct),
          pagination,
        };
      } catch (error) {
        if (error instanceof Error) {
          return { errors: [error.message], product: null };
        } else {
          throw Error("Internal server error");
        }
      }
    },
  },
  Mutation: {
    async createProduct(
      _: any,
      args: { input: CreateProductInput },
      context: any,
    ) {
      const apiKey = context.apiKey;

      if (!apiKey) {
        throw new Error("Missing or invalid API key");
      }

      const input = await validateDto(CreateProductDto, args.input);

      try {
        const product = await ProductService.createProduct(
          apiKey.clientId,
          input,
        );

        return { errors: null, product: formatProduct(product) };
      } catch (error) {
        if (error instanceof Error) {
          return { errors: [error.message], product: null };
        } else {
          throw Error("Internal server error");
        }
      }
    },

    async updateProduct(
      _: any,
      args: { productId: string; input: UpdateProductInput },
      context: any,
    ) {
      const apiKey = context.apiKey;

      if (!apiKey) {
        throw new Error("Missing or invalid API key");
      }

      const input = await validateDto(UpdateProductDto, args.input);

      try {
        const product = await ProductService.updateProduct(
          args.productId,
          apiKey.clientId,
          input,
        );

        return { errors: null, product: formatProduct(product) };
      } catch (error) {
        if (error instanceof Error) {
          return { errors: [error.message], product: null };
        } else {
          throw Error("Internal server error");
        }
      }
    },

    async updateProductStatus(
      _: any,
      args: { productId: string; isActive: boolean },
      context: any,
    ) {
      const apiKey = context.apiKey;

      if (!apiKey) {
        throw new Error("Missing or invalid API key");
      }

      try {
        const product = await ProductService.updateProduct(
          args.productId,
          apiKey.clientId,
          { isActive: args.isActive },
        );

        return { errors: null, product: formatProduct(product) };
      } catch (error) {
        if (error instanceof Error) {
          return { errors: [error.message], product: null };
        } else {
          throw Error("Internal server error");
        }
      }
    },

    async deleteProduct(_: any, args: { productId: string }, context: any) {
      const apiKey = context.apiKey;

      if (!apiKey) {
        throw new Error("Missing or invalid API key");
      }

      try {
        const product = await ProductService.deleteProduct(
          args.productId,
          apiKey.clientId,
        );

        return { errors: null, id: product.id };
      } catch (error) {
        if (error instanceof Error) {
          return { errors: [error.message], id: null };
        } else {
          throw Error("Internal server error");
        }
      }
    },

    async createProductImage(
      _: any,
      args: {
        productId: string;
        input: { file: { file: Promise<FileUpload> } };
      },
      context: any,
    ) {
      const apiKey = context.apiKey;

      if (!apiKey) {
        throw new Error("Missing or invalid API key");
      }

      let databaseImage: GraphQlImage | null = null;

      try {
        databaseImage = await ProductService.createImage(
          apiKey.clientId,
          args.productId,
        );

        const data = await ImageUploadService.uploadImage(
          args.input.file.file,
          `products/${args.productId}/images/${databaseImage.id}`,
        );

        if (!data.Location) {
          throw new Error("Image upload failed");
        }
        const uploadedImage = await ProductService.setImageUrl(
          databaseImage.id,
          data.Location,
        );
        return { errors: null, image: uploadedImage };
      } catch (error) {
        if (databaseImage?.id) {
          await ProductService.deleteFailedImage(databaseImage.id);
        }
        if (error instanceof Error) {
          return { errors: [error.message], image: null };
        } else {
          throw Error("Internal server error");
        }
      }
    },
  },
};
