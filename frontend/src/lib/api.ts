import type { Product, Order } from '@/types';

const PRODUCT_BASE = 'http://localhost:3001';
const ORDER_BASE = 'http://localhost:3002';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  products: {
    list: () => request<Product[]>(`${PRODUCT_BASE}/products`),
    create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      request<Product>(`${PRODUCT_BASE}/products`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) =>
      request<Product>(`${PRODUCT_BASE}/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<void>(`${PRODUCT_BASE}/products/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request<Order[]>(`${ORDER_BASE}/orders`),
    create: (data: { items: { productId: string; quantity: number }[] }) =>
      request<Order>(`${ORDER_BASE}/orders`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: Order['status']) =>
      request<Order>(`${ORDER_BASE}/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    remove: (id: string) =>
      request<void>(`${ORDER_BASE}/orders/${id}`, { method: 'DELETE' }),
  },
};
