const API_BASE = 'http://localhost:5000/api';

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || localStorage.getItem('fog_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },
  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res);
  },

  // Products
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return handleResponse(res);
  },
  getDistricts: async () => {
    const res = await fetch(`${API_BASE}/products/districts`);
    return handleResponse(res);
  },
  getProductById: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse(res);
  },
  createProduct: async (productData) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(res);
  },
  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(res);
  },
  updateProductStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/products/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  // Farmer
  getFarmerPublic: async (id) => {
    const res = await fetch(`${API_BASE}/farmers/public/${id}`);
    return handleResponse(res);
  },
  getMyListings: async () => {
    const res = await fetch(`${API_BASE}/farmers/my-listings`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  getMyFarmerOrders: async () => {
    const res = await fetch(`${API_BASE}/farmers/my-orders`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  getFarmerStats: async () => {
    const res = await fetch(`${API_BASE}/farmers/stats`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  submitVerification: async (data) => {
    const res = await fetch(`${API_BASE}/farmers/verification`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Orders
  createOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(res);
  },
  getMyBuyerOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  getOrderById: async (id) => {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  updateOrderStatus: async (id, statusData) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(statusData)
    });
    return handleResponse(res);
  },

  // Reviews
  getProductReviews: async (productId) => {
    const res = await fetch(`${API_BASE}/reviews/product/${productId}`);
    return handleResponse(res);
  },
  submitReview: async (reviewData) => {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData)
    });
    return handleResponse(res);
  },

  // Addresses
  getAddresses: async () => {
    const res = await fetch(`${API_BASE}/addresses`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  addAddress: async (addrData) => {
    const res = await fetch(`${API_BASE}/addresses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(addrData)
    });
    return handleResponse(res);
  },
  deleteAddress: async (id) => {
    const res = await fetch(`${API_BASE}/addresses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  markAsRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  markAllNotificationsAsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Complaints
  createComplaint: async (data) => {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  getMyComplaints: async () => {
    const res = await fetch(`${API_BASE}/complaints/my`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Admin
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  getAdminUsers: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/users?${q}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  updateUserStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },
  getAdminVerifications: async () => {
    const res = await fetch(`${API_BASE}/admin/verifications`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  reviewVerification: async (id, data) => {
    const res = await fetch(`${API_BASE}/admin/verifications/${id}/review`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  getAdminComplaints: async () => {
    const res = await fetch(`${API_BASE}/admin/complaints`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  resolveComplaint: async (id, data) => {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}/resolve`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  moderateProduct: async (id, status) => {
    const res = await fetch(`${API_BASE}/admin/products/${id}/moderate`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  }
};
