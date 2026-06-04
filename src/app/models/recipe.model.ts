export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiImage {
  url: string;
  alternativeText?: string;
}

export interface Ingredient {
  name: string;
  amount?: string;
  unit?: string;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface Recipe {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  instructions?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  image?: StrapiImage | null;
  category?: Category;
  ingredients?: Ingredient[];
}
