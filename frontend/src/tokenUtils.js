
export const getAccessToken = () => {
    return localStorage.getItem('token'); // Retrieve access token from localStorage
  };
  
  export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken'); // Retrieve refresh token from localStorage
  };
  
  export const setAccessToken = (token) => {
    localStorage.setItem('token', token); // Save access token to localStorage
  };
  
  export const setRefreshToken = (token) => {
    localStorage.setItem('refreshToken', token); // Save refresh token to localStorage
  };
  
  export const clearTokens = () => {
    localStorage.removeItem('token'); // Clear access token
    localStorage.removeItem('refreshToken'); // Clear refresh token
  };
  