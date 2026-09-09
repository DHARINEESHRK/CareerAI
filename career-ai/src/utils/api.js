import { logout } from './auth';

const BASE_URL = typeof window !== 'undefined' && !window.location.origin.includes('localhost')
  ? `${window.location.origin}/api`
  : "http://localhost:5000/api";


export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Ensure we don't double up the URL if it's already an absolute path
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Debug log for troubleshooting URL issues
  // console.log(`API_FETCH: ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Session expired
    logout();
    return null;
  }

  return response;
};
