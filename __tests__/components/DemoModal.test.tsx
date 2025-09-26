import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DemoModal } from '../../components/modals/DemoModal'

// Mock the useTwitterDemo hook
jest.mock('../../hooks/useTwitterDemo', () => ({
  useTwitterDemo: jest.fn()
}))

const mockUseTwitterDemo = require('../../hooks/useTwitterDemo').useTwitterDemo

describe('DemoModal', () => {
  const defaultMockReturn = {
    demoInput: '',
    setDemoInput: jest.fn(),
    generatedThread: '',
    isGenerating: false,
    error: null,
    handleGenerateThread: jest.fn(),
    clearDemo: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTwitterDemo.mockReturnValue(defaultMockReturn)
  })

  it('should not render when isOpen is false', () => {
    render(<DemoModal isOpen={false} onClose={jest.fn()} />)
    expect(screen.queryByText('Content Cascade AI Demo')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    expect(screen.getByText('Content Cascade AI Demo')).toBeInTheDocument()
    expect(screen.getByText('AI Twitter Thread Generator')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<DemoModal isOpen={true} onClose={onClose} />)
    
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should display textarea for input', () => {
    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    
    const textarea = screen.getByPlaceholderText('Paste your content here or provide a URL...')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('required')
  })

  it('should call handleGenerateThread on form submit', () => {
    const handleGenerateThread = jest.fn()
    mockUseTwitterDemo.mockReturnValue({
      ...defaultMockReturn,
      demoInput: 'Test content',
      handleGenerateThread
    })

    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    
    const form = screen.getByRole('form', { name: /generate twitter thread/i }) ||
                 screen.getByText('Generate Twitter Thread').closest('form')
    
    if (form) {
      fireEvent.submit(form)
      expect(handleGenerateThread).toHaveBeenCalledTimes(1)
    }
  })

  it('should show loading state when generating', () => {
    mockUseTwitterDemo.mockReturnValue({
      ...defaultMockReturn,
      isGenerating: true
    })

    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    expect(screen.getByText('Generating...')).toBeDisabled()
  })

  it('should display error message when error exists', () => {
    mockUseTwitterDemo.mockReturnValue({
      ...defaultMockReturn,
      error: 'Generation failed'
    })

    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText('❌ Error:')).toBeInTheDocument()
    expect(screen.getByText('Generation failed')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should display generated thread when available', () => {
    const mockThread = '🚀 This is a test thread\n\n🧵 1/3\n\nTest content here...'
    mockUseTwitterDemo.mockReturnValue({
      ...defaultMockReturn,
      generatedThread: mockThread
    })

    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText('🎉 Generated Twitter Thread:')).toBeInTheDocument()
    expect(screen.getByText(mockThread)).toBeInTheDocument()
    expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument()
    expect(screen.getByText('Open Twitter')).toBeInTheDocument()
  })

  it('should call clearDemo when Clear button is clicked', () => {
    const clearDemo = jest.fn()
    mockUseTwitterDemo.mockReturnValue({
      ...defaultMockReturn,
      clearDemo
    })

    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    
    const clearButton = screen.getByText('Clear')
    fireEvent.click(clearButton)
    
    expect(clearDemo).toHaveBeenCalledTimes(1)
  })

  it('should call clearDemo when Try Again button is clicked', () => {
    const clearDemo = jest.fn()
    mockUseTwitterDemo.mockReturnValue({
      ...defaultMockReturn,
      error: 'Test error',
      clearDemo
    })

    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    
    const tryAgainButton = screen.getByText('Try Again')
    fireEvent.click(tryAgainButton)
    
    expect(clearDemo).toHaveBeenCalledTimes(1)
  })

  it('should copy to clipboard when Copy button is clicked', async () => {
    const mockThread = 'Test thread content'
    mockUseTwitterDemo.mockReturnValue({
      ...defaultMockReturn,
      generatedThread: mockThread
    })

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn()
      }
    })

    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    
    const copyButton = screen.getByText('Copy to Clipboard')
    fireEvent.click(copyButton)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockThread)
  })

  it('should open Twitter when Open Twitter button is clicked', () => {
    mockUseTwitterDemo.mockReturnValue({
      ...defaultMockReturn,
      generatedThread: 'Test thread'
    })

    // Mock window.open
    const mockOpen = jest.fn()
    Object.assign(window, { open: mockOpen })

    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    
    const openTwitterButton = screen.getByText('Open Twitter')
    fireEvent.click(openTwitterButton)
    
    expect(mockOpen).toHaveBeenCalledWith('https://twitter.com/compose/tweet', '_blank')
  })

  it('should show demo features status', () => {
    render(<DemoModal isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText('📹 UGC Videos')).toBeInTheDocument()
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    expect(screen.getByText('📱 Social Posts')).toBeInTheDocument()
    expect(screen.getByText('Twitter Threads (Live)')).toBeInTheDocument()
    expect(screen.getByText('📧 Email Campaigns')).toBeInTheDocument()
  })
})
