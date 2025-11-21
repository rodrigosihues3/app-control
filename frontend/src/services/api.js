import axios from 'axios';

// Configuración base de Axios
// Detectamos si estamos en desarrollo (Vite) o producción
const isDev = import.meta.env.MODE === 'development';

const api = axios.create({
  // Si es Dev -> localhost:3000
  // Si es Prod -> Ruta relativa '/api' (Nginx lo manejará)
  baseURL: isDev ? 'http://localhost:3000/api' : '/api',
});

// --- INTERCEPTOR ---
// Antes de cada petición, inyectamos el token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// ---------------------------

// Servicio para Registros (Asistencia)
export const getRegistros = async (page = 0, size = 10) => {
  // Enviamos los query params
  const response = await api.get(`/registro?page=${page}&size=${size}`);
  return response.data;
};

export const registrarAsistencia = async (data) => {
  // data = { dni, nombres, apellidos, tipo }
  const response = await api.post('/registro', data);
  return response.data;
};

// Servicio para Visitantes
export const buscarVisitante = async (dni) => {
  const response = await api.get(`/visitantes/${dni}`);
  return response.data;
};

// --- SERVICIO DE LOGIN (NUEVO) ---
export const loginAdmin = async (credenciales) => {
  const response = await api.post('/auth/login', credenciales);
  return response.data;
};

// --- GESTIÓN DE VISITANTES ---
export const getVisitantes = async (page = 0, search = '') => {
  const response = await api.get(`/visitantes?page=${page}&search=${search}`);
  return response.data;
};

export const createVisitante = async (data) => {
  return await api.post('/visitantes', data);
};

export const updateVisitante = async (id, data) => {
  return await api.put(`/visitantes/${id}`, data);
};

export const deleteVisitante = async (id) => {
  return await api.delete(`/visitantes/${id}`);
};

export const getHistorialPorId = async (id) => {
  const response = await api.get(`/visitantes/${id}/historial`);
  return response.data;
};

export const getAdmins = async () => {
  const response = await api.get('/auth');
  return response.data;
};

export const createAdmin = async (data) => {
  // data = { usuario, password, nombre }
  return await api.post('/auth', data);
};

export const deleteAdmin = async (id) => {
  return await api.delete(`/auth/${id}`);
};

export default api;