import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "../pages/login";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Login Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
    require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    delete global.fetch;
  });

  test("renders login form with correct elements", () => {
    // Unit Test: Verifies the UI elements of the Login component.
    // Software: Login Component
    // Purpose: Ensure all necessary elements like input fields, logo, and buttons are rendered correctly.
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Check for the logo
    expect(screen.getByAltText("Logo")).toBeInTheDocument();

    // Check for the form elements
    expect(
      screen.getByPlaceholderText(/enter your username/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("shows toast notification for empty username", async () => {
    // Unit Test: Validates the form validation logic for empty username.
    // Software: Login Component
    // Purpose: Ensure a toast notification is shown when username is missing.
    render(
      <MemoryRouter>
        <Login />
        <ToastContainer />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for the toast message
    await waitFor(() =>
      expect(
        screen.getByText(/please fill in the username/i)
      ).toBeInTheDocument()
    );
  });

  test("shows toast notification for empty password", async () => {
    // Unit Test: Validates the form validation logic for empty password.
    // Software: Login Component
    // Purpose: Ensure a toast notification is shown when password is missing.
    render(
      <MemoryRouter>
        <Login />
        <ToastContainer />
      </MemoryRouter>
    );

    // Fill username but leave password empty
    fireEvent.change(screen.getByPlaceholderText(/enter your username/i), {
      target: { value: "testuser" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for the toast message
    await waitFor(() =>
      expect(screen.getByText(/please fill in password\./i)).toBeInTheDocument()
    );
  });

  test("shows error message on invalid credentials", async () => {
    // Integration Test: Verifies the interaction between the frontend and the API on invalid login.
    // Software: Login component's interaction with the API
    // Purpose: Ensure an appropriate error message is displayed when invalid credentials are provided.
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: "Invalid credentials" }),
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText(/enter your username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for the error message
    await waitFor(() =>
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    );

    // Ensure fetch was called with correct arguments
    expect(global.fetch).toHaveBeenCalledWith("http://52.7.128.221:8000/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "testuser", password: "wrongpassword" }),
    });
  });

  test("redirects to /home on successful login", async () => {
    // System Test: Simulates a full user login process and checks for successful redirection and storage updates.
    // Software: Login workflow, including navigation and token storage
    // Purpose: Validate that the user is redirected to "/home" and tokens are stored on successful login.
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access: "mockAccessToken",
            refresh: "mockRefreshToken",
          }),
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText(/enter your username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "correctpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for navigation and localStorage updates
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/home"));
    expect(localStorage.getItem("username")).toBe("testuser");
    expect(localStorage.getItem("token")).toBe("mockAccessToken");
    expect(localStorage.getItem("refresh")).toBe("mockRefreshToken");
  });
});
