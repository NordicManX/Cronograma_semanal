import axios from 'axios';

// Cria uma instância do axios com a URL base da nossa API em Go.
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

// Interceptor: Adiciona o token JWT a todos os pedidos, se ele existir.
// Isto é crucial para aceder a rotas protegidas.
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;