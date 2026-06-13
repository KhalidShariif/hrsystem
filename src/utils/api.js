export const API_URL = 'http://localhost:5000/api';

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = {};
    const text = await response.text();
    try {
      errorData = JSON.parse(text);
    } catch (e) {
      errorData = { message: text || 'Something went wrong' };
    }
    
    // Auto logout on token expiration or account disabled
    if (response.status === 401 || (response.status === 403 && errorData.message?.includes('disabled'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('hayaan_user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?error=' + encodeURIComponent(errorData.message || 'Session expired');
      }
    }
    
    const error = new Error(errorData.message || 'Something went wrong');
    error.response = { data: errorData, status: response.status, text };
    throw error;
  }

  return response.json();
};
