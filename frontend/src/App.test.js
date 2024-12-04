import { render, screen } from '@testing-library/react';
import App from './App'; 

test('renders NOTE VAULT header', () => {
  render(<App />);
  const headingElement = screen.getByText(/Note Vault/i); 
  expect(headingElement).toBeInTheDocument();
});
