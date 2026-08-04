const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request failed');
  return data as T;
}

type ApiResponse<T> = { success: boolean; data: T; message?: string };
export async function getProducts(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<{ data: any[] }>(`/products${qs}`);
}

export async function getProduct(slug: string) {
  return request<{ data: any }>(`/products/${encodeURIComponent(slug)}`);
}

// Categories
export async function getCategories() {
  return request<{ data: any[] }>('/categories');
}

// Cart
export async function getCart() {
  return request<{ data: any[]; total: number }>('/cart');
}

export async function addToCart(product_id: string, quantity = 1) {
  return request('/cart', { method: 'POST', body: JSON.stringify({ product_id, quantity }) });
}

export async function updateCartItem(id: string, quantity: number) {
  return request(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
}

export async function removeCartItem(id: string) {
  return request(`/cart/${id}`, { method: 'DELETE' });
}

export async function clearCart() {
  return request('/cart', { method: 'DELETE' });
}

// Orders
export async function createOrder(data: any) {
  return request<ApiResponse<{ order_number: string; midtrans_redirect_url?: string }>>('/orders', { method: 'POST', body: JSON.stringify(data) });
}

export async function getOrder(orderNumber: string) {
  return request<ApiResponse<any>>(`/orders?order_number=${encodeURIComponent(orderNumber)}`);
}

// Shipping
export async function getProvinces() {
  return request<{ data: any[] }>('/shipping/provinces');
}

export async function getCities(province?: string) {
  const qs = province ? `?province=${province}` : '';
  return request<{ data: any[] }>(`/shipping/cities${qs}`);
}

export async function getShippingCost(data: { origin: string; destination: string; weight: number; courier: string }) {
  return request<{ data: any[] }>('/shipping/cost', { method: 'POST', body: JSON.stringify(data) });
}

// Contact
export async function submitContact(data: { name: string; email: string; subject: string; message: string }) {
  return request('/contact', { method: 'POST', body: JSON.stringify(data) });
}
