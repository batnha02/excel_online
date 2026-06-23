import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const listFiles = () => api.get('/files');
export const uploadFile = (formData) => api.post('/files/upload', formData);
export const createBlank = (name) => api.post('/files/new', { name });
export const getFile = (id) => api.get(`/files/${id}`);
export const saveFile = (id, sheets) => api.put(`/files/${id}`, { sheets });
export const deleteFile = (id) => api.delete(`/files/${id}`);

export const downloadFile = (id, name) => {
  const a = document.createElement('a');
  a.href = `/api/files/${id}/download`;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
