export const apiCallWithToken = async (url, options = {}) => {
    const accessToken = localStorage.getItem('access'); // Get the access token from localStorage
  
    // Set the Authorization header with the token
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
      // If token expired, refresh the token
      const refreshToken = localStorage.getItem('refresh');
      const newToken = await refreshAccessToken(refreshToken);
  
      if (newToken) {
        localStorage.setItem('access', newToken.access); // Store the new access token
        mergedOptions.headers.Authorization = `Bearer ${newToken.access}`; // Set new access token
        return await fetch(url, mergedOptions); // Retry the original request
      } else {
        logout(); // If refreshing the token fails, log the user out
      }
    }
  
    return response;
  };
  
  // Refresh access token using the refresh token
  export const refreshAccessToken = async (refreshToken) => {
    const response = await fetch('http://localhost:8000/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
  
    if (response.ok) {
      return await response.json(); // Returns { access: "newAccessToken" }
    }
    return null;
  };
  
  // Logout function
  export const logout = (navigate) => {
    
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login'); // Redirect to login page
  };
  
