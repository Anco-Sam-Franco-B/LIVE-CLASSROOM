import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),

  login: (data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, permissions: [] });
  },

  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken: refreshToken || useAuthStore.getState().refreshToken });
  },

  loadPermissions: async () => {
    try {
      const { data } = await axios.get('/api/auth/permissions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      const perms = data.data.map(p => p.slug);
      localStorage.setItem('permissions', JSON.stringify(perms));
      set({ permissions: perms });
    } catch {
      console.error('Failed to load permissions');
    }
  },

  hasPermission: (slug) => {
    return get().permissions.includes(slug);
  },

  hasAnyPermission: (...slugs) => {
    return slugs.some(slug => get().permissions.includes(slug));
  },
}));

export default useAuthStore;
