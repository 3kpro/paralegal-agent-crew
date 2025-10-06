import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import ForgotPasswordPage from '@/app/forgot-password/page';

// Mock Next.js router
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh
  }),
  useSearchParams: () => ({
    get: jest.fn()
  })
}));

// Mock window location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000'
  },
  writable: true
});

// Mock Supabase client
const mockResetPasswordForEmail = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail
    }
  })
}));

describe('Password Reset Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockResetPasswordForEmail.mockClear();
  });

  it('should render forgot password page', () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('should show success message when email is sent successfully', async () => {
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
  });

  it('should show error message when email sending fails', async () => {
    const errorMessage = 'Email not found';
    mockResetPasswordForEmail.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'bad@example.com' } });
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});