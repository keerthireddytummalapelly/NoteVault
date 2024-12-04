export const apiCallWithToken = async (url, options = {}) => {
    const accessToken = localStorage.getItem('access'); 
  
     const defaultHeaders = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  
    const mergedOptions = {
      ...options,
      headers: { ...defaultHeaders, ...(options.headers || {}) },
    };
  
    const response = await fetch(url, mergedOptions);
  
    if (response.status === 401) {
      
      const refreshToken = localStorage.getItem('refresh');
      const newToken = await refreshAccessToken(refreshToken);
  
      if (newToken) {
        localStorage.setItem('access', newToken.access); 
        mergedOptions.headers.Authorization = `Bearer ${newToken.access}`; 
        return await fetch(url, mergedOptions); 
      } else {
        logout();       }
    }
  
    return response;
  };
  
  
  export const refreshAccessToken = async (refreshToken) => {
    const response = await fetch('http://52.7.128.221:8000/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
  
    if (response.ok) {
      return await response.json(); 
    }
    return null;
  };
  
  
  export const logout = (navigate) => {
    
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login'); 
  };
  
