export type GraphQlImage = {
  id: string;
  url: string | null;
};

export type GraphQlProduct = {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  stock: number;
  price: number;
  images: GraphQlImage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FormattedProduct = Omit<
  GraphQlProduct,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  description: string | null;
  stock: number | null;
  price: number;
};

export type UpdateProductInput = {
  name: string | null;
  description: string | null;
  stock: number | null;
  price: number | null;
};

export type ProductPaginationInput = {
  page: number | null;
  limit: number | null;
};
