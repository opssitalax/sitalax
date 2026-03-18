import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global fetch interceptor to inject Authorization header
const originalFetch = window.fetch;

const customFetch = async (...args: Parameters<typeof fetch>) => {
  let [resource, config] = args;
  
  let url = '';
  if (typeof resource === 'string') {
    url = resource;
  } else if (resource instanceof Request) {
    url = resource.url;
  } else if (resource instanceof URL) {
    url = resource.toString();
  }

  const isApiRequest = url.includes('/api/') && !url.includes('/api/auth') && !url.includes('/api/public');

  if (isApiRequest) {
    const token = localStorage.getItem('sitalax_token');
    if (token) {
      if (resource instanceof Request) {
        resource.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config = config || {};
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`
        };
      }
    }
  }
  
  const response = await originalFetch(resource, config);
  
  // If we get a 401, we might want to clear the token and redirect to login
  if (response.status === 401 && isApiRequest && !url.includes('/api/auth/me')) {
    localStorage.removeItem('sitalax_token');
    window.location.href = '/login';
  }
  
  return response;
};

try {
  window.fetch = customFetch;
} catch (e) {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    configurable: true,
    enumerable: true,
    writable: true
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
