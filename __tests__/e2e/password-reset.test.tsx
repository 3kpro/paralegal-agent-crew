import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import ForgotPasswordPage from '@/app/forgot-password/page';
import ResetPasswordPage from '@/app/reset-password/page';
import LoginPage from '@/app/(auth)/login/page';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock Next.js router
const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    refresh: mockRefresh,
    replace: mockReplace
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn()
  }))
}));

// Mock window location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000',
    replace: jest.fn()
  },
  writable: true
});

// Mock Supabase client
const mockResetPasswordForEmail = jest.fn();
const mockUpdateUser = jest.fn();
const mockGetSession = jest.fn();
const mockSignInWithPassword = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      getSession: mockGetSession,
      signInWithPassword: mockSignInWithPassword
    }
  })
}));

describe('Password Reset E2E Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockReplace.mockClear();
    mockResetPasswordForEmail.mockClear();
    mockUpdateUser.mockClear();
    mockGetSession.mockClear();
    mockSignInWithPassword.mockClear();
  });

  describe('Forgot Password Page', () => {
    it('should render forgot password form', () => {
      render(<ForgotPasswordPage />);
      
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
      expect(screen.getByText('Enter your email address and we\'ll send you a link to reset your password.')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login');
    });

    it('should require email field', async () => {
      render(<ForgotPasswordPage />);
      
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      const emailInput = screen.getByRole('textbox', { name: /email address/i });
      
      fireEvent.click(submitButton);
      
      // Check that form validation prevents submission
      expect(emailInput).toBeRequired();
    });

    it('should send password reset email successfully', async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });
      
      render(<ForgotPasswordPage />);
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i });
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });
      
      await act(async () => {
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
          redirectTo: 'http://localhost:3000/reset-password'
        });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Email Sent!')).toBeInTheDocument();
        expect(screen.getByText(/We've sent a password reset link to/)).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('should handle email sending error', async () => {
      const errorMessage = 'Email not found';
      mockResetPasswordForEmail.mockResolvedValueOnce({ error: { message: errorMessage } });
      
      render(<ForgotPasswordPage />);
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i });
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
      });
      
      await act(async () => {
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      mockResetPasswordForEmail.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      );
      
      render(<ForgotPasswordPage />);
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i });
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });
      
      await act(async () => {
        fireEvent.click(submitButton);
      });
      
      expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    });

    it('should allow trying again after successful email send', async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });
      
      render(<ForgotPasswordPage />);
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i });
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Email Sent!')).toBeInTheDocument();
      });
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      
      await act(async () => {
        fireEvent.click(tryAgainButton);
      });
      
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
      expect(screen.queryByText('Email Sent!')).not.toBeInTheDocument();
    });
  });

  describe('Reset Password Page', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null });
    });

    it('should render reset password form', async () => {
      await act(async () => {
        render(<ResetPasswordPage />);
      });
      
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
      expect(screen.getByText(/password requirements/i)).toBeInTheDocument();
    });

    it('should require both password fields', async () => {
      await act(async () => {
        render(<ResetPasswordPage />);
      });
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      expect(passwordInput).toBeRequired();
      expect(confirmPasswordInput).toBeRequired();
      expect(passwordInput).toHaveAttribute('minLength', '6');
      expect(confirmPasswordInput).toHaveAttribute('minLength', '6');
    });

    it('should validate password matching', async () => {
      await act(async () => {
        render(<ResetPasswordPage />);
      });
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole('button', { name: /update password/i });
      
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should validate password length', async () => {
      await act(async () => {
        render(<ResetPasswordPage />);
      });
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole('button', { name: /update password/i });
      
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: '123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
      });
    });

    it('should successfully reset password', async () => {
      mockUpdateUser.mockResolvedValueOnce({ error: null });
      
      await act(async () => {
        render(<ResetPasswordPage />);
      });
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole('button', { name: /update password/i });
      
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          password: 'newpassword123'
        });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Password Reset Successful!')).toBeInTheDocument();
      });
      
      // Should auto-redirect after 3 seconds
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      }, { timeout: 4000 });
    });

    it('should handle password update error', async () => {
      const errorMessage = 'Failed to update password';
      mockUpdateUser.mockResolvedValueOnce({ error: { message: errorMessage } });
      
      await act(async () => {
        render(<ResetPasswordPage />);
      });
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole('button', { name: /update password/i });
      
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show loading state during password update', async () => {
      mockUpdateUser.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      );
      
      await act(async () => {
        render(<ResetPasswordPage />);
      });
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole('button', { name: /update password/i });
      
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
        fireEvent.click(submitButton);
      });
      
      expect(screen.getByRole('button', { name: /updating password/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /updating password/i })).toBeDisabled();
    });

    it('should handle invalid reset session', async () => {
      mockGetSession.mockResolvedValueOnce({ 
        data: { session: null }, 
        error: { message: 'Invalid session' }
      });
      
      await act(async () => {
        render(<ResetPasswordPage />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Invalid or expired reset link')).toBeInTheDocument();
      });
    });
  });

  describe('Login Page Integration', () => {
    it('should have forgot password link that navigates to forgot password page', () => {
      render(<LoginPage />);
      
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should render login form with all required elements', () => {
      render(<LoginPage />);
      
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    });
  });

  describe('Complete Password Reset Flow Integration', () => {
    it('should complete full password reset flow', async () => {
      // Step 1: Start from login page
      const { unmount: unmountLogin } = render(<LoginPage />);
      
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
      
      unmountLogin();
      
      // Step 2: Navigate to forgot password page
      mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });
      
      const { unmount: unmountForgot } = render(<ForgotPasswordPage />);
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i });
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(mockResetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
          redirectTo: 'http://localhost:3000/reset-password'
        });
        expect(screen.getByText('Email Sent!')).toBeInTheDocument();
      });
      
      unmountForgot();
      
      // Step 3: Navigate to reset password page (simulating email click)
      mockGetSession.mockResolvedValueOnce({ 
        data: { session: { user: { id: 'user-id' } } }, 
        error: null 
      });
      mockUpdateUser.mockResolvedValueOnce({ error: null });
      
      await act(async () => {
        render(<ResetPasswordPage />);
      });
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const updateButton = screen.getByRole('button', { name: /update password/i });
      
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'newsecurepassword123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'newsecurepassword123' } });
        fireEvent.click(updateButton);
      });
      
      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          password: 'newsecurepassword123'
        });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Password Reset Successful!')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /continue to login/i })).toHaveAttribute('href', '/login');
      });
      
      // Should auto-redirect to login
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      }, { timeout: 4000 });
    });
  });
});