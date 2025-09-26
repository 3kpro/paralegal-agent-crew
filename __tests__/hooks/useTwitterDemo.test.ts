import { renderHook, act } from '@testing-library/react'
import { useTwitterDemo } from '../../hooks/useTwitterDemo'

// Mock fetch
global.fetch = jest.fn()

describe('useTwitterDemo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTwitterDemo())

    expect(result.current.demoInput).toBe('')
    expect(result.current.generatedThread).toBe('')
    expect(result.current.isGenerating).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should update demoInput when setDemoInput is called', () => {
    const { result } = renderHook(() => useTwitterDemo())

    act(() => {
      result.current.setDemoInput('Test input')
    })

    expect(result.current.demoInput).toBe('Test input')
  })

  it('should clear all data when clearDemo is called', () => {
    const { result } = renderHook(() => useTwitterDemo())

    act(() => {
      result.current.setDemoInput('Test input')
    })

    act(() => {
      result.current.clearDemo()
    })

    expect(result.current.demoInput).toBe('')
    expect(result.current.generatedThread).toBe('')
    expect(result.current.error).toBeNull()
  })

  it('should handle successful thread generation', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        success: true,
        trackingId: 'test-tracking-id'
      })
    }

    const mockStatusResponse = {
      ok: true,
      json: async () => ({
        status: 'completed',
        thread: 'Generated thread content'
      })
    }

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse) // Initial POST
      .mockResolvedValue(mockStatusResponse) // Status polling

    const { result } = renderHook(() => useTwitterDemo())

    act(() => {
      result.current.setDemoInput('Test content')
    })

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      result.current.handleGenerateThread(mockEvent)
    })

    expect(result.current.isGenerating).toBe(true)
    expect(result.current.error).toBeNull()

    // Fast-forward timers to trigger polling
    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.generatedThread).toBe('Generated thread content')
    expect(result.current.isGenerating).toBe(false)
  })

  it('should handle API error responses', async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({
        success: false,
        message: 'API Error'
      })
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useTwitterDemo())

    act(() => {
      result.current.setDemoInput('Test content')
    })

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      result.current.handleGenerateThread(mockEvent)
    })

    expect(result.current.error).toBe('API Error')
    expect(result.current.isGenerating).toBe(false)
  })

  it('should handle network errors', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useTwitterDemo())

    act(() => {
      result.current.setDemoInput('Test content')
    })

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      result.current.handleGenerateThread(mockEvent)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.isGenerating).toBe(false)
  })

  it('should handle failed generation status', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        success: true,
        trackingId: 'test-tracking-id'
      })
    }

    const mockStatusResponse = {
      ok: true,
      json: async () => ({
        status: 'failed',
        error: 'Generation failed'
      })
    }

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValue(mockStatusResponse)

    const { result } = renderHook(() => useTwitterDemo())

    act(() => {
      result.current.setDemoInput('Test content')
    })

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      result.current.handleGenerateThread(mockEvent)
    })

    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.error).toBe('Generation failed')
    expect(result.current.isGenerating).toBe(false)
  })

  it('should timeout after 30 seconds', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        success: true,
        trackingId: 'test-tracking-id'
      })
    }

    const mockStatusResponse = {
      ok: true,
      json: async () => ({
        status: 'processing',
        progress: 50
      })
    }

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValue(mockStatusResponse)

    const { result } = renderHook(() => useTwitterDemo())

    act(() => {
      result.current.setDemoInput('Test content')
    })

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      result.current.handleGenerateThread(mockEvent)
    })

    expect(result.current.isGenerating).toBe(true)

    // Fast-forward to timeout
    await act(async () => {
      jest.advanceTimersByTime(30000)
    })

    expect(result.current.error).toBe('Generation timed out. Please try again.')
    expect(result.current.isGenerating).toBe(false)
  })

  it('should handle polling errors', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        success: true,
        trackingId: 'test-tracking-id'
      })
    }

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse) // Initial POST succeeds
      .mockRejectedValue(new Error('Polling error')) // Status polling fails

    const { result } = renderHook(() => useTwitterDemo())

    act(() => {
      result.current.setDemoInput('Test content')
    })

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      result.current.handleGenerateThread(mockEvent)
    })

    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.error).toBe('Failed to check generation status')
    expect(result.current.isGenerating).toBe(false)
  })
})
