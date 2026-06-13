import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithAuth, API_URL } from '../utils/api';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    logo: null,
    primaryColor: '#00236F'
  });
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const response = await fetch(`${API_URL}/settings/branding`);
      if (response.ok) {
        const data = await response.json();
        setBranding(data);
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  useEffect(() => {
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', branding.primaryColor);
    }
  }, [branding.primaryColor]);

  const updateBranding = async (formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/settings/branding`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      setBranding(data);
      return data;
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update branding');
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, loading, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
