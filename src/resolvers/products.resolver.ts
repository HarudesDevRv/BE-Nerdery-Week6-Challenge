import { gql } from "apollo-server-express";
import { ProductService } from "../services/products.service";
import { ApiKeyService } from "../services/api-key.service";
import { validateDto } from "../utils/validations";
import {
  CreateProductDto,
  UpdateProductDto,
} from "../dtos/products/product.dto";

// GraphQL typeDefs
export const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    stock: Int!
    price: Float!
    clientId: ID!
    isActive: Boolean
    createdAt: String
    updatedAt: String
  }

  type Query {
    getProductById(id: ID!): Product
  }

  input ProductInput {
    name: String!
    description: String
    stock: Int = 0
    price: Float!
  }

  input ProductUpdateInput {
    name: String
    description: String
    stock: Int
    price: Float
  }

  type ProductPayload {
    errors: [String!]
    product: Product
  }
  type ProductDeletePayload {
    errors: [String!]
    id: ID!
  }

  type Mutation {
    createProduct(input: ProductInput!): ProductPayload!
    updateProduct(productId: ID!, input: ProductUpdateInput): ProductPayload!
    updateProductStatus(productId: ID!, status: Boolean!): ProductPayload!
    deleteProduct(productId: ID!): ProductDeletePayload!
  }
`;

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

      return product;
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

        return { errors: null, product: product };
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

        return { errors: null, product: product };
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
      args: { productId: string; status: boolean },
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
          { isActive: args.status },
        );

        return { errors: null, product: product };
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
  },
};
