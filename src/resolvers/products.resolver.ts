import { gql } from "apollo-server-express";
import { ProductService } from "../services/products.service";
import { ApiKeyService } from "../services/api-key.service";
import { validateDto } from "../utils/validations";
import { readFileSync } from "fs";

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import path from "path";
import { formatProduct } from "../utils/product-utilities";
import { CreateProductDto } from "../dtos/products/create-product-dto";
import { UpdateProductDto } from "../dtos/products/update-product-dto";

// GraphQL typeDefs
export const typeDefs = readFileSync("./src/schemas/schema.gql", "utf-8");

const client = new S3Client({
  region: process.env.AWS_BUCKET,
});

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
  },
  Mutation: {
    async createProduct(_: any, args: { input: any }, context: any) {
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
      args: { productId: string; input: any },
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
          return { errors: [error.message], product: null };
        } else {
          throw Error("Internal server error");
        }
      }
    },

    async createProductImage(
      _: any,
      args: { productId: string; input: { file: any } },
      context: any,
    ) {
      const apiKey = context.apiKey;

      if (!apiKey) {
        throw new Error("Missing or invalid API key");
      }

      try {
        const databaseImage = await ProductService.createImage(
          apiKey.clientId,
          args.productId,
        );

        const { createReadStream, filename, mimetype, encoding } =
          await args.input.file.file;

        const extension = path.extname(filename);
        const stream = createReadStream();

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `products/${args.productId}/images/${databaseImage.id + extension}`,
          Body: stream,
        };

        const upload = new Upload({
          client: client,
          params: uploadParams,
        });

        const data = await upload.done();
        if (!data.Location) {
          await ProductService.deleteFailedImage(databaseImage.id);
          throw new Error("Image upload failed");
        }
        const uploadedImage = await ProductService.setImageUrl(
          databaseImage.id,
          data.Location,
        );
        return { errors: [], image: uploadedImage };
      } catch (error) {
        if (error instanceof Error) {
          return { errors: [error.message], product: null };
        } else {
          throw Error("Internal server error");
        }
      }
    },
  },
};
