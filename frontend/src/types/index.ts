export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: string | null;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FieldConfig {
  id: number;
  name: string;
  fieldType: 'TEXT' | 'LIST' | 'RADIO';
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  required: boolean;
  listOfValues1?: string[];
}
