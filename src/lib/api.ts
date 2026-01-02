import { 
  User, 
  Category, 
  Item, 
  Supplier, 
  IncomingGoods, 
  OutgoingGoods, 
  ItemRequest, 
  PurchaseOrder, 
  StockMovement,
} from '@/types';

// API Base URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// Token storage
const TOKEN_KEY = 'auth_token';

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// HTTP client with auth headers
const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  },
};

// User API
export const userApi = {
  getAll: (): Promise<User[]> => apiClient.get('/users'),
  
  getById: (id: string): Promise<User> => apiClient.get(`/users/${id}`),

  create: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => 
    apiClient.post('/users', user),

  update: (id: string, updates: Partial<User>): Promise<User> => 
    apiClient.put(`/users/${id}`, updates),

  delete: (id: string): Promise<{ message: string }> => 
    apiClient.delete(`/users/${id}`),
};

// Category API
export const categoryApi = {
  getAll: (): Promise<Category[]> => apiClient.get('/categories'),
  
  getById: (id: string): Promise<Category> => apiClient.get(`/categories/${id}`),

  create: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => 
    apiClient.post('/categories', category),

  update: (id: string, updates: Partial<Category>): Promise<Category> => 
    apiClient.put(`/categories/${id}`, updates),

  delete: (id: string): Promise<{ message: string }> => 
    apiClient.delete(`/categories/${id}`),
};

// Item API
export const itemApi = {
  getAll: (): Promise<Item[]> => apiClient.get('/items'),
  
  getById: (id: string): Promise<Item> => apiClient.get(`/items/${id}`),

  getLowStock: (): Promise<Item[]> => apiClient.get('/items/low-stock'),

  create: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => 
    apiClient.post('/items', item),

  update: (id: string, updates: Partial<Item>): Promise<Item> => 
    apiClient.put(`/items/${id}`, updates),

  updateStock: (id: string, quantityChange: number): Promise<Item> => 
    apiClient.put(`/items/${id}/stock`, { quantityChange }),

  delete: (id: string): Promise<{ message: string }> => 
    apiClient.delete(`/items/${id}`),
};

// Supplier API
export const supplierApi = {
  getAll: (): Promise<Supplier[]> => apiClient.get('/suppliers'),
  
  getById: (id: string): Promise<Supplier> => apiClient.get(`/suppliers/${id}`),

  create: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => 
    apiClient.post('/suppliers', supplier),

  update: (id: string, updates: Partial<Supplier>): Promise<Supplier> => 
    apiClient.put(`/suppliers/${id}`, updates),

  delete: (id: string): Promise<{ message: string }> => 
    apiClient.delete(`/suppliers/${id}`),
};

// Incoming Goods API
export const incomingGoodsApi = {
  getAll: (): Promise<IncomingGoods[]> => apiClient.get('/incoming-goods'),
  
  getById: (id: string): Promise<IncomingGoods> => apiClient.get(`/incoming-goods/${id}`),

  create: (data: Omit<IncomingGoods, 'id' | 'transactionNumber' | 'status' | 'createdAt' | 'updatedAt'>): Promise<IncomingGoods> => 
    apiClient.post('/incoming-goods', data),

  update: (id: string, updates: Partial<IncomingGoods>): Promise<IncomingGoods> => 
    apiClient.put(`/incoming-goods/${id}`, updates),

  submit: (id: string): Promise<IncomingGoods> => 
    apiClient.post(`/incoming-goods/${id}/submit`),

  approve: (id: string, userId: string, signatureImage: string, items: any, status: any): Promise<IncomingGoods> => 
    apiClient.post(`/incoming-goods/${id}/approve`, { userId, signatureImage, items, status }),

  reject: (id: string, userId: string, reason: string, status: string): Promise<IncomingGoods> => 
    apiClient.post(`/incoming-goods/${id}/reject`, { userId, reason , status}),

  delete: (id: string): Promise<{ message: string }> => 
    apiClient.delete(`/incoming-goods/${id}`),
};

// Outgoing Goods API
export const outgoingGoodsApi = {
  getAll: (): Promise<OutgoingGoods[]> => apiClient.get('/outgoing-goods'),
  
  getById: (id: string): Promise<OutgoingGoods> => apiClient.get(`/outgoing-goods/${id}`),

  create: (data: Omit<OutgoingGoods, 'id' | 'transactionNumber' | 'status' | 'createdAt' | 'updatedAt'>): Promise<OutgoingGoods> => 
    apiClient.post('/outgoing-goods', data),

  update: (id: string, updates: Partial<OutgoingGoods>): Promise<OutgoingGoods> => 
    apiClient.put(`/outgoing-goods/${id}`, updates),

  submit: (id: string): Promise<OutgoingGoods> => 
    apiClient.post(`/outgoing-goods/${id}/submit`),

  approve: (id: string, userId: string, signatureImage: string, status: any, items: any): Promise<OutgoingGoods> => 
    apiClient.post(`/outgoing-goods/${id}/approve`, { userId, signatureImage, status , items}),

  reject: (id: string, userId: string, reason: string, status: string): Promise<OutgoingGoods> => 
    apiClient.post(`/outgoing-goods/${id}/reject`, { userId, reason , status}),

  delete: (id: string): Promise<{ message: string }> => 
    apiClient.delete(`/outgoing-goods/${id}`),
};

// Item Request API
export const itemRequestApi = {
  getAll: (): Promise<ItemRequest[]> => apiClient.get('/item-requests'),
  
  getById: (id: string): Promise<ItemRequest> => apiClient.get(`/item-requests/${id}`),

  create: (data: Omit<ItemRequest, 'id' | 'transactionNumber' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ItemRequest> => 
    apiClient.post('/item-requests', data),

  update: (id: string, updates: Partial<ItemRequest>): Promise<ItemRequest> => 
    apiClient.put(`/item-requests/${id}`, updates),

  submit: (id: string): Promise<ItemRequest> => 
    apiClient.post(`/item-requests/${id}/submit`),

  approve: (id: string, userId: string, signatureImage: string, status: string, items: any): Promise<ItemRequest> => 
    apiClient.post(`/item-requests/${id}/approve`, { userId, signatureImage , status, items}),

  reject: (id: string, userId: string, reason: string, status: string): Promise<ItemRequest> => 
    apiClient.post(`/item-requests/${id}/reject`, { userId, reason, status }),

  delete: (id: string): Promise<{ message: string }> => 
    apiClient.delete(`/item-requests/${id}`),
};

// Purchase Order API
export const purchaseOrderApi = {
  getAll: (): Promise<PurchaseOrder[]> => apiClient.get('/purchase-orders'),
  
  getById: (id: string): Promise<PurchaseOrder> => apiClient.get(`/purchase-orders/${id}`),

  create: (data: Omit<PurchaseOrder, 'id' | 'transactionNumber' | 'status' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> => 
    apiClient.post('/purchase-orders', data),

  update: (id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> => 
    apiClient.put(`/purchase-orders/${id}`, updates),

  submit: (id: string): Promise<PurchaseOrder> => 
    apiClient.post(`/purchase-orders/${id}/submit`),

  approve: (id: string, userId: string, signatureImage: string, status: string, items: any): Promise<PurchaseOrder> => 
    apiClient.post(`/purchase-orders/${id}/approve`, { userId, signatureImage, status, items }),

  reject: (id: string, userId: string, reason: string, status: any): Promise<PurchaseOrder> => 
    apiClient.post(`/purchase-orders/${id}/reject`, { userId, reason , status}),

  delete: (id: string): Promise<{ message: string }> => 
    apiClient.delete(`/purchase-orders/${id}`),
};

// Stock Movement API
export const stockMovementApi = {
  getAll: (): Promise<StockMovement[]> => apiClient.get('/stock-movements'),
  
  getByItemId: (itemId: string): Promise<StockMovement[]> => 
    apiClient.get(`/stock-movements/item/${itemId}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: (): Promise<{
    totalItems: number;
    lowStockItems: number;
    pendingApprovals: number;
    totalCategories: number;
    totalSuppliers: number;
    recentMovements: StockMovement[];
  }> => apiClient.get('/dashboard/stats'),
};

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/login', { 
        username, 
        password 
      });
      setToken(response.token);
      return response.user;
    } catch {
      return null;
    }
  },

  logout: (): void => {
    removeToken();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = getToken();
    if (!token) return null;
    
    try {
      return await apiClient.get<User>('/auth/me');
    } catch {
      removeToken();
      return null;
    }
  },

  getToken,
  setToken,
  removeToken,
};
