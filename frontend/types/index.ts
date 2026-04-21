export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  creator: { id: string; name: string };
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  creator: { id: string; name: string };
  categories: { category: { id: string; name: string } }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl: string | null;
  createdAt: string;
}
