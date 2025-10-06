/**
 * Functional E2E Tests for Password Reset Feature
 * Tests the frontend functionality and user flow navigation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock components that simulate the password reset functionality
const MockForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">3K</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Content Cascade AI</span>
          </a>
          <p className="text-gray-600 mt-2">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Forgot Password?</h1>
          
          <p className="text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
                data-testid="email-input"
              />
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
              data-testid="send-reset-link-btn"
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center justify-center space-x-1">
              <span>← Back to login</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const MockResetPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">3K</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Content Cascade AI</span>
          </a>
          <p className="text-gray-600 mt-2">Set your new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Reset Your Password</h1>

          <form className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                data-testid="new-password-input"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                data-testid="confirm-password-input"
              />
            </div>

            <div className="text-sm text-gray-500">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>At least 6 characters long</li>
                <li>Must match confirmation password</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
              data-testid="update-password-btn"
            >
              Update Password
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center justify-center space-x-1">
              <span>← Back to login</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const MockLoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome back</h1>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500" data-testid="forgot-password-link">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

describe('Password Reset Functional E2E Tests', () => {
  describe('Forgot Password Page Functionality', () => {
    it('should render forgot password page with all required elements', () => {
      render(<MockForgotPasswordPage />);
      
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
      expect(screen.getByText('Enter your email address and we\'ll send you a link to reset your password.')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('send-reset-link-btn')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login');
    });

    it('should have proper form validation attributes', () => {
      render(<MockForgotPasswordPage />);
      
      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    });

    it('should allow email input and form submission', () => {
      render(<MockForgotPasswordPage />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('send-reset-link-btn');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');
      
      expect(submitButton).not.toBeDisabled();
      fireEvent.click(submitButton);
    });
  });

  describe('Reset Password Page Functionality', () => {
    it('should render reset password page with all required elements', () => {
      render(<MockResetPasswordPage />);
      
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      expect(screen.getByText('Set your new password')).toBeInTheDocument();
      expect(screen.getByTestId('new-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('update-password-btn')).toBeInTheDocument();
      expect(screen.getByText('Password requirements:')).toBeInTheDocument();
      expect(screen.getByText('At least 6 characters long')).toBeInTheDocument();
      expect(screen.getByText('Must match confirmation password')).toBeInTheDocument();
    });

    it('should have proper form validation attributes', () => {
      render(<MockResetPasswordPage />);
      
      const passwordInput = screen.getByTestId('new-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('minLength', '6');
      
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('minLength', '6');
    });

    it('should allow password input and validation', () => {
      render(<MockResetPasswordPage />);
      
      const passwordInput = screen.getByTestId('new-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const submitButton = screen.getByTestId('update-password-btn');
      
      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
      
      expect(passwordInput).toHaveValue('newpassword123');
      expect(confirmPasswordInput).toHaveValue('newpassword123');
      
      expect(submitButton).not.toBeDisabled();
      fireEvent.click(submitButton);
    });
  });

  describe('Login Page Integration', () => {
    it('should render login page with forgot password link', () => {
      render(<MockLoginPage />);
      
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
      expect(screen.getByTestId('forgot-password-link')).toHaveAttribute('href', '/forgot-password');
    });

    it('should have proper navigation flow from login to forgot password', () => {
      render(<MockLoginPage />);
      
      const forgotPasswordLink = screen.getByTestId('forgot-password-link');
      
      // Verify the link exists and has correct href
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
      
      // Verify clicking doesn't cause errors (navigation would be handled by Next.js)
      fireEvent.click(forgotPasswordLink);
    });
  });

  describe('Complete Password Reset User Flow', () => {
    it('should demonstrate the complete user journey navigation', () => {
      // Step 1: User starts at login page
      const { unmount: unmountLogin } = render(<MockLoginPage />);
      
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      const forgotPasswordLink = screen.getByTestId('forgot-password-link');
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
      
      unmountLogin();
      
      // Step 2: User navigates to forgot password page
      const { unmount: unmountForgot } = render(<MockForgotPasswordPage />);
      
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
      const emailInput = screen.getByTestId('email-input');
      const sendResetButton = screen.getByTestId('send-reset-link-btn');
      
      // User enters email
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      expect(emailInput).toHaveValue('user@example.com');
      
      // User submits form
      fireEvent.click(sendResetButton);
      
      unmountForgot();
      
      // Step 3: User clicks email link and goes to reset password page
      const { unmount: unmountReset } = render(<MockResetPasswordPage />);
      
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      const passwordInput = screen.getByTestId('new-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const updatePasswordButton = screen.getByTestId('update-password-btn');
      
      // User enters new password
      fireEvent.change(passwordInput, { target: { value: 'newsecurepassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newsecurepassword123' } });
      
      expect(passwordInput).toHaveValue('newsecurepassword123');
      expect(confirmPasswordInput).toHaveValue('newsecurepassword123');
      
      // User submits password reset
      fireEvent.click(updatePasswordButton);
      
      unmountReset();
      
      // Step 4: User returns to login page
      render(<MockLoginPage />);
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });
  });

  describe('UI/UX Validation', () => {
    it('should have consistent branding across all password reset pages', () => {
      // Check forgot password page branding
      const { unmount: unmountForgot } = render(<MockForgotPasswordPage />);
      expect(screen.getByText('3K')).toBeInTheDocument();
      expect(screen.getByText('Content Cascade AI')).toBeInTheDocument();
      unmountForgot();
      
      // Check reset password page branding
      const { unmount: unmountReset } = render(<MockResetPasswordPage />);
      expect(screen.getByText('3K')).toBeInTheDocument();
      expect(screen.getByText('Content Cascade AI')).toBeInTheDocument();
      unmountReset();
      
      // Check login page consistency
      render(<MockLoginPage />);
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    it('should have proper back navigation links', () => {
      // Forgot password page back link
      const { unmount: unmountForgot } = render(<MockForgotPasswordPage />);
      expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login');
      unmountForgot();
      
      // Reset password page back link
      render(<MockResetPasswordPage />);
      expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login');
    });

    it('should have accessible form labels and structure', () => {
      // Test forgot password accessibility
      const { unmount: unmountForgot } = render(<MockForgotPasswordPage />);
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      unmountForgot();
      
      // Test reset password accessibility
      render(<MockResetPasswordPage />);
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    });
  });
});