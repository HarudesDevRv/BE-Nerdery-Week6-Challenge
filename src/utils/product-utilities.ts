type graphQlImage = {
  id: string;
  url: string;
};

type graphQlProduct = {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  stock: number;
  price: number;
  images: graphQlImage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type formattedProduct = Omit<graphQlProduct, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export function formatProduct(product: graphQlProduct): formattedProduct {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
