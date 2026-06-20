import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate axios instance for file uploads without default Content-Type
const uploadApi = axios.create({
  baseURL: API_BASE_URL,
});

export const layoutAPI = {
  getHeader: () => api.get('/layout/header'),
  getFooter: () => api.get('/layout/footer'),
  updateHeader: (data) => api.post('/layout/header', data),
  updateFooter: (data) => api.post('/layout/footer', data),
};

export const imageAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadApi.post('/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getUrl: (id) => `/api/image/${id}`,
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getAllAdmin: () => api.get('/categories/all'),
  getRoot: () => api.get('/categories/root'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const productsAPI = {
  getAll: (categoryId) => api.get('/products', { params: { categoryId } }),
  getAllAdmin: () => api.get('/products/all'),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
};

export const cartAPI = {
  getItems: (userId) => api.get(`/cart/${userId}`),
  addItem: (item) => api.post('/cart', item),
  updateItem: (id, item) => api.put(`/cart/${id}`, item),
  deleteItem: (id) => api.delete(`/cart/${id}`),
  clearCart: (userId) => api.delete(`/cart/user/${userId}`),
};

export const advertisementsAPI = {
  getAll: (position, categoryId) => api.get('/advertisements', { params: { position, categoryId } }),
  getById: (id) => api.get(`/advertisements/${id}`),
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getUserOrders: (userId) => api.get(`/orders/user/${userId}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  remove: (id) => api.delete(`/orders/${id}`),
};

export const validationAPI = {
  getSettings: (entityType) => api.get(`/validation/settings/${entityType}`),
  seed: () => api.post('/validation/seed'),
  reseed: () => api.post('/validation/reseed'),
};

export const savedAddressesAPI = {
  getByUserId: (userId) => api.get(`/savedaddresses/${userId}`),
  getDefault: (userId) => api.get(`/savedaddresses/${userId}/default`),
  getById: (id) => api.get(`/savedaddresses/single/${id}`),
  create: (data) => api.post('/savedaddresses', data),
  update: (id, data) => api.put(`/savedaddresses/${id}`, data),
  setDefault: (id) => api.put(`/savedaddresses/${id}/setdefault`),
  delete: (id) => api.delete(`/savedaddresses/${id}`),
};

export const addressConfigurationAPI = {
  getConfiguration: () => api.get('/addressconfiguration'),
  updateConfiguration: (id, data) => api.put(`/addressconfiguration/${id}`, data),
};

export const taxAPI = {
  getConfiguration: () => api.get('/taxconfiguration'),
  update: (id, data) => api.put(`/taxconfiguration/${id}`, data),
  create: (data) => api.post('/taxconfiguration', data),
};

export const seedAPI = {
  seedDatabase: () => api.post('/seed'),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
  remove: (id) => api.delete(`/users/${id}`),
};

export default api;
