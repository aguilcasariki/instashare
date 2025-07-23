/**
 * @fileoverview
 * Tests for the AuthPage component using Vitest and React Testing Library.
 * - Mocks Firebase Auth and Next.js router.
 * - Covers login, sign up, validation, loading, and error handling.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPage from "../page";
import * as firebaseAuth from "firebase/auth";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import * as React from "react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock Firebase Auth methods
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

describe("AuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Should render the login form by default
   */
  it("renders login form by default", () => {
    render(<AuthPage />);
    expect(screen.getByRole("button", { name: /sign up/i })).toBeDefined();
    expect(screen.getAllByText(/login/i)[0]).toBeDefined();
    expect(screen.getByPlaceholderText(/email/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/password/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
  });

  /**
   * Should toggle to the sign up form when the toggle button is clicked
   */
  it("toggles to sign up form", () => {
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(screen.getByRole("button", { name: /sign up/i })).toBeDefined();
    expect(screen.getAllByText(/sign up/i)[0]).toBeDefined();
    expect(screen.getByPlaceholderText(/email/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/password/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
  });

  /**
   * Should show a validation error for invalid email
   */
  it("shows error on invalid email", async () => {
    render(<AuthPage />);
    fireEvent.input(screen.getByPlaceholderText(/email/i), {
      target: { value: "invalid.@gmail.com" },
    });
    fireEvent.input(screen.getByPlaceholderText(/password/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(await screen.findByText(/invalid email address/i)).toBeDefined();
  });

  /**
   * Should call signInWithEmailAndPassword on login
   */
  it("calls signInWithEmailAndPassword on login", async () => {
    (
      firebaseAuth.signInWithEmailAndPassword as unknown as Mock
    ).mockResolvedValue({});
    render(<AuthPage />);
    fireEvent.input(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.input(screen.getByPlaceholderText(/password/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() =>
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        "123456"
      )
    );
  });

  /**
   * Should call createUserWithEmailAndPassword on sign up
   */
  it("calls createUserWithEmailAndPassword on sign up", async () => {
    (
      firebaseAuth.createUserWithEmailAndPassword as unknown as Mock
    ).mockResolvedValue({});
    render(<AuthPage />);
    // Switch to sign up mode
    fireEvent.click(screen.getByText(/sign up/i));
    fireEvent.input(screen.getByPlaceholderText(/email/i), {
      target: { value: "signup@example.com" },
    });
    fireEvent.input(screen.getByPlaceholderText(/password/i), {
      target: { value: "abcdef" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() =>
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "signup@example.com",
        "abcdef"
      )
    );
  });

  /**
   * Should show loading state when submitting
   */
  it("shows loading state when submitting", async () => {
    // Make the promise never resolve to simulate loading
    (
      firebaseAuth.signInWithEmailAndPassword as unknown as Mock
    ).mockImplementation(() => new Promise(() => {}));
    render(<AuthPage />);
    fireEvent.input(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.input(screen.getByPlaceholderText(/password/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(
      await screen.findByRole("button", { name: /please wait/i })
    ).toBeDefined();
  });

  /**
   * Should show error message if authentication fails
   */
  it("shows error message on authentication failure", async () => {
    (
      firebaseAuth.signInWithEmailAndPassword as unknown as Mock
    ).mockRejectedValue(new Error("Invalid credentials"));
    render(<AuthPage />);
    fireEvent.input(screen.getByPlaceholderText(/email/i), {
      target: { value: "fail@example.com" },
    });
    fireEvent.input(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeDefined();
  });
});
