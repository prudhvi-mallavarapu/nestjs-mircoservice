import type { Product, Order } from '@/types';

const PRODUCTS = '/api/products';
const ORDERS = '/api/orders';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request<T>(url: string, init?: RequestInit, attempt = 0): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      let msg = text;
      try { msg = JSON.parse(text)?.message ?? text; } catch {}
      throw new Error(msg);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (e: any) {
    // Retry on network errors (backend not ready yet) — not on HTTP errors
    if (attempt < 8 && e?.message === 'Failed to fetch') {
      await delay(2000);
      return request(url, init, attempt + 1);
    }
    throw e;
  }
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
