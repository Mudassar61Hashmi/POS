export interface User {
  id: string;
  username: string;
  role: "admin" | "cashier";
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  barcode: string;
}

export interface Sale {
  id: string;
  user_id: string;
  total: number;
  timestamp: string;
  cashier: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  price: number;
  name: string;
}
