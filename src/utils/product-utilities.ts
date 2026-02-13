import { FormattedProduct, GraphQlProduct } from "./product.types";

export function formatProduct(product: GraphQlProduct): FormattedProduct {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
