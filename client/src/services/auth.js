import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.user),
  updateProfile: (data) => api.put('/auth/profile', data).then((r) => r.data.user),
  changePassword: (data) => api.put('/auth/password', data).then((r) => r.data),
};
