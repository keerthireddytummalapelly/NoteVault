import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { ToastContainer } from 'react-toastify';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Profile from '../pages/profile';
import Signup from '../pages/signup';
import Header from '../components/header';

global.fetch = jest.fn();
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: jest.fn(),
}));
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();

    const mockToken = 'mock-token';
    global.localStorage = {
      getItem: jest.fn().mockReturnValue(mockToken),
    };
  });

// Integration Test: Verifies that the profile component fetches and displays user data correctly.
// Software: Profile component and API interaction.
// Purpose: To ensure the frontend correctly integrates with the backend to display user profile data.
  test('loads user profile data on mount', async () => {
    const mockProfile = {
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'Test',
      last_name: 'User',
      image: null,
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });
    render(
      <MemoryRouter>
        <Profile />
        <ToastContainer />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('testuser@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('User')).toBeInTheDocument();
    });
  });

// Integration Test: Verifies that the reset password functionality works correctly, 
//                   handling both form submission and backend response.
// Software: Password reset form, API interaction, and toast notifications.
// Purpose: To ensure the user can successfully reset their password 
//          and receive the appropriate success toast notification.
  test('handles reset password correctly', async () => {
    const mockProfile = {
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'Test',
      last_name: 'User',
      image: null,
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });
    render(
      <MemoryRouter>
        <Profile />
        <ToastContainer />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Reset Password'));
    fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldPassword123' }, });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'newPassword123' }, });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newPassword123' }, });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Password reset successfully' }),
    });
    await act(async () => { fireEvent.click(screen.getByText('Save')); });
    expect(global.fetch).toHaveBeenCalledWith('http://52.7.128.221:8000/reset-password/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_password: 'oldPassword123',
        new_password: 'newPassword123',
      }),
    });
    await waitFor(() => { expect(toast.success).toHaveBeenCalledWith('Password reset successfully');});
  });

// Integration Test: Simulates the password reset process and verifies error handling.
// Software: Password reset form, API response, error toast.
// Purpose: To ensure error messages are shown when the reset fails.

  test('shows error toast when reset password fails', async () => {
    const mockProfile = {
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'Test',
      last_name: 'User',
      image: null,
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });
    render(
      <MemoryRouter>
        <Profile />
        <ToastContainer />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Reset Password'));
    fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldPassword123' },});
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {target: { value: 'newPassword123' },});
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {target: { value: 'newPassword123' },});
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to reset password' }),
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to reset password');
    });
  });

// Integration Test: Simulates profile update and verifies successful API response.
// Software: Profile form, API request, success toast.
// Purpose: To ensure the profile is updated correctly and success toast is shown.

  test('should successfully save the profile', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane.doe@example.com',
        }),
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          first_name: 'John',
          last_name: 'Doe',
          email: '', 
        }),
      })
    );
    render(<Profile />);
    fireEvent.change(screen.getByLabelText(/First Name/i), {target: { value: 'John' },});
    fireEvent.change(screen.getByLabelText(/Last Name/i), {target: { value: 'Doe' },});
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        'http://52.7.128.221:8000/profile/', 
        expect.objectContaining({
          method: 'PUT', 
          body: JSON.stringify({
            first_name: 'John',
            last_name: 'Doe',
            email: '',
          }),
        })
      )
    );
    expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
    expect(screen.queryByText(/Save/i)).not.toBeInTheDocument();
  });


// Integration Test: Simulates profile update failure and verifies error handling.
// Software: Profile form, API error response, error toast.
// Purpose: To ensure the error is handled correctly and the error message is displayed.

  test('should show an error when the API call fails', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to update profile' }),
      })
    );
    console.error = jest.fn();

    render(<Profile />);
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: 'Doe' },
    });
  
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('An error occurred'));
    expect(console.error).toHaveBeenCalledWith('Error updating profile:', expect.any(Error));
    expect(toast.error).toHaveBeenCalledWith('An error occurred');
  });
});

// System Test: Simulates a full user signup process and checks for successful token storage and redirection.
// Software: Signup workflow, including form validation, API integration, and token handling.
// Purpose: To validate that a user is successfully signed up and redirected to "/home", 
            // with access and refresh tokens stored in localStorage upon successful registration.

describe('Signup Component - Successful Signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('should show success toast and navigate to /home on successful signup', async () => {
    const mockResponse = {
      access: 'fakeAccessToken',
      refresh: 'fakeRefreshToken',
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText('Enter your first name'), { target: { value: 'Alen' }, });
    fireEvent.change(screen.getByPlaceholderText('Enter your last name'), { target: { value: 'Wilde' }, });
    fireEvent.change(screen.getByPlaceholderText('Enter your username'), { target: { value: 'AlenW' }, });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'alenw@example.com' }, });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123$' }, });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'Password123$' }, });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Signup successful! Redirecting...');
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });


// Integration Testing: Verifies how multiple components 
//                      (form inputs, validation, and notifications) interact and work together.
// Software: Signup component and toast notification.
// Purpose: Ensure that an error toast appears when passwords do not match.

  test('should show error toast when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText('Enter your first name'), { target: { value: 'Alen' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your last name'), { target: { value: 'Wilde' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your username'), { target: { value: 'AlenW' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'alenw@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123$' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'Password124$' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Passwords do not match');
    });
  });


// Integration Testing: Verifies interaction between form, API, error handling, and navigation.
// Software: Signup component, toast, and navigation.
// Purpose: Ensure error toast and prevent navigation on failed signup.
  test('should show error toast and prevent navigation on failed signup', async () => {
    const mockErrorResponse = {
      message: 'Email already in use',
    };
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(mockErrorResponse),
    });
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText('Enter your first name'), { target: { value: 'Alen' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your last name'), { target: { value: 'Wilde' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your username'), { target: { value: 'AlenW' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'alenw@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123$' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'Password123$' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already in use');
    });
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

// Integration Testing: Verifies interaction between form submission, API failure, and error handling.
// Software: Signup component and toast notification.
// Purpose: Ensure a generic error toast is shown on network failure.
  test('should show generic error toast on network failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText('Enter your first name'), { target: { value: 'Alen' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your last name'), { target: { value: 'Wilde' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your username'), { target: { value: 'AlenW' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'alenw@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123$' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'Password123$' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong. Please try again.');
    });
  });

// Integration Testing: Verifies interaction between form, API error handling, and navigation prevention.
// Software: Signup component, toast, and navigation.
// Purpose: Ensure error toast when the username already exists and prevent navigation on failed signup.
  test('should show error toast when username already exists', async () => {
    const mockErrorResponse = {
      message: 'Username already exists',
    };
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(mockErrorResponse),
    });
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText('Enter your first name'), { target: { value: 'Alen' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your last name'), { target: { value: 'Wilde' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your username'), { target: { value: 'AlenW' } }); 
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'alenw@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123$' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'Password123$' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Username already exists');
    });
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});



// Integration Test: Simulates the sidebar toggle functionality and verifies that the 
//                  View Profile and Logout options appear when the sidebar is opened and disappear when closed.
// Software: Sidebar toggle functionality and header component interaction.
// Purpose: To validate that the sidebar can be toggled correctly, 
//             showing and hiding the "View Profile" and "Logout" options as expected. 

describe('Sidebar Visibility and Options in Header', () => {
  test('should toggle sidebar visibility and show correct options', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const sidebar = screen.queryByText(/View Profile/i);
    expect(sidebar).not.toBeInTheDocument();

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    const viewProfileOption = screen.getByText(/View Profile/i);
    const logoutOption = screen.getByText(/Logout/i);

    expect(viewProfileOption).toBeInTheDocument();
    expect(logoutOption).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(viewProfileOption).not.toBeInTheDocument();
    expect(logoutOption).not.toBeInTheDocument();
  });
});


// Unit Testing: Verifies the rendering of static text and UI elements in the header.
// Software: Header component and Nav bar
// Purpose: Ensure "NoteVault" text and hamburger icon are displayed in the header.
describe('Header Component', () => {
  test('should display "NoteVault" in the header and the hamburger icon', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const header = screen.getByRole('banner');
    const noteVaultText = within(header).getByText(/NoteVault/i);
    expect(noteVaultText).toBeInTheDocument();
    const hamburgerIcon = screen.getByRole('button');
    expect(hamburgerIcon).toBeInTheDocument();
  });
});

