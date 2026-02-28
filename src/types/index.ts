export interface User {
  id: number;
  username: string;
  role: "admin" | "cashier";
}

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  barcode: string;
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export interface Sale {
  id: number;
  user_id: number;
  total: number;
  timestamp: string;
  cashier: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
}
