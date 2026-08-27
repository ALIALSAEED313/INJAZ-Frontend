import api from './api';

export async function getNotifications() {
  const response = await api.get('/notifications');
  return response.data;
}

export async function markAsRead(notificationId) {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllAsRead() {
  const response = await api.put('/notifications/read-all');
  return response.data;
}
