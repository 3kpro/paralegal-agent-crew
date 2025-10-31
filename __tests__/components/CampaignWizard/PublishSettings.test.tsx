import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PublishSettings } from '@/components/CampaignWizard/PublishSettings'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
type SupabaseMockResponse = {
  data: any;
  error: any;
}

type SupabaseMock = {
  from: jest.Mock<{
    select: jest.Mock<{
      eq: jest.Mock<{
        single: jest.Mock<Promise<SupabaseMockResponse>>;
      }>;
    }>;
    insert: jest.Mock<{
      select: jest.Mock<{
        single: jest.Mock<Promise<SupabaseMockResponse>>;
      }>;
    }>;
    update: jest.Mock<{
      eq: jest.Mock<Promise<SupabaseMockResponse>>;
    }>;
  }>;
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

// Mock window.location
const mockLocation = {
  href: '',
  origin: 'http://localhost:3000',
  assign: jest.fn()
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

beforeEach(() => {
  mockLocation.assign.mockClear()
})

describe('PublishSettings', () => {
  const mockProps = {
    settings: {},
    onChange: jest.fn(),
    onBack: jest.fn(),
    campaignData: {
      content: 'Test content',
      style: { theme: 'dark' }
    }
  }

  const mockSupabase: SupabaseMock = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: '123' },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      })
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    ) as jest.Mock
  })

  it('renders platform selection buttons', () => {
    render(<PublishSettings {...mockProps} />)
    
    expect(screen.getByTestId('platform-button-tiktok')).toBeInTheDocument()
    expect(screen.getByTestId('platform-button-twitter')).toBeInTheDocument()
  })

  it('initiates OAuth flow when clicking unconnected platform', async () => {
    render(<PublishSettings {...mockProps} />)
    
    const tiktokButton = screen.getByTestId('platform-button-tiktok')
    fireEvent.click(tiktokButton)

    await waitFor(() => {
      expect(window.location.href).toContain('open-api.tiktok.com/platform/oauth/connect')
      expect(window.location.href).toContain('client_id=')
      expect(window.location.href).toContain('redirect_uri=')
    })
  })

  it('selects platform when already connected', async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { is_active: true },
            error: null
          })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: '123' },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    }))

    render(<PublishSettings {...mockProps} />)
    
    const tiktokButton = screen.getByTestId('platform-button-tiktok')
    fireEvent.click(tiktokButton)

    await waitFor(() => {
      expect(tiktokButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  it('shows error when publishing without platform selection', async () => {
    render(<PublishSettings {...mockProps} />)
    
    const publishButton = screen.getByTestId('publish-button')
    fireEvent.click(publishButton)

    const errorMessage = await screen.findByTestId('error-message')
    expect(errorMessage).toHaveTextContent('Please select at least one platform')
  })

  it('handles successful publishing flow', async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { is_active: true },
            error: null
          })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: '123' },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    }))

    render(<PublishSettings {...mockProps} />)
    
    // Select platform
    const tiktokButton = screen.getByTestId('platform-button-tiktok')
    fireEvent.click(tiktokButton)

    await waitFor(() => {
      expect(tiktokButton).toHaveAttribute('aria-pressed', 'true')
    })

    // Click publish
    const publishButton = screen.getByTestId('publish-button')
    fireEvent.click(publishButton)

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith('/campaigns/123/success')
    })
  })

  it('handles publishing error', async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { is_active: true },
            error: null
          })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      })
    }))

    render(<PublishSettings {...mockProps} />)
    
    // Select platform
    const tiktokButton = screen.getByTestId('platform-button-tiktok')
    fireEvent.click(tiktokButton)

    await waitFor(() => {
      expect(tiktokButton).toHaveAttribute('aria-pressed', 'true')
    })

    // Click publish
    const publishButton = screen.getByTestId('publish-button')
    fireEvent.click(publishButton)

    const errorMessage = await screen.findByTestId('error-message')
    expect(errorMessage).toHaveTextContent('Database error')
  })

  it('calls onBack when clicking back button', () => {
    render(<PublishSettings {...mockProps} />)
    
    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockProps.onBack).toHaveBeenCalled()
  })
})