import type { Product, Order } from '@/types';

const PRODUCTS = '/api/products';
const ORDERS = '/api/orders';

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
    list: () => request<Product[]>(PRODUCTS),
    create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      request<Product>(PRODUCTS, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) =>
      request<Product>(`${PRODUCTS}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<void>(`${PRODUCTS}/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request<Order[]>(ORDERS),
    create: (data: { items: { productId: string; quantity: number }[] }) =>
      request<Order>(ORDERS, { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: Order['status']) =>
      request<Order>(`${ORDERS}/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    remove: (id: string) =>
      request<void>(`${ORDERS}/${id}`, { method: 'DELETE' }),
  },
};
