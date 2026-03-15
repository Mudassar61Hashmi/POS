export interface User {
  id: string;
  username: string;
  role: "admin" | "cashier" | "manager";
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
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
  customer_id?: string;
  subtotal: number;
  discount: number;
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
