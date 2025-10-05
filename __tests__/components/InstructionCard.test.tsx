import { render, screen, fireEvent } from '@testing-library/react';
import { InstructionCard } from '@/components/InstructionCard';

const mockProviderData = {
  name: 'OpenAI',
  description: 'Industry-leading GPT models for text generation and completion',
  setupTime: '2-3 minutes',
  cost: 'Pay-per-use (~$0.01-0.06/1K tokens)',
  keyFormat: 'sk-...',
  getKeyUrl: 'https://platform.openai.com/api-keys',
  steps: [
    {
      step: 1,
      title: 'Create OpenAI Account',
      description: 'Visit the OpenAI platform and sign up for an account.',
      action: 'Sign up at platform.openai.com'
    },
    {
      step: 2,
      title: 'Generate API Key',
      description: 'Navigate to the API keys section and create a new API key.',
      action: 'Click "Create new secret key"'
    },
    {
      step: 3,
      title: 'Copy API Key',
      description: 'Copy the generated API key and paste it in the field above.',
      action: 'Copy the key starting with "sk-"'
    }
  ]
};

describe('InstructionCard Component', () => {
  it('should render provider information correctly', () => {
    render(<InstructionCard provider={mockProviderData} />);
    
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Industry-leading GPT models for text generation and completion')).toBeInTheDocument();
    expect(screen.getByText('2-3 minutes')).toBeInTheDocument();
    expect(screen.getByText('Pay-per-use (~$0.01-0.06/1K tokens)')).toBeInTheDocument();
    expect(screen.getByText('sk-...')).toBeInTheDocument();
  });

  it('should start collapsed by default', () => {
    render(<InstructionCard provider={mockProviderData} />);
    
    // Steps should not be visible initially
    expect(screen.queryByText('Create OpenAI Account')).not.toBeInTheDocument();
    expect(screen.queryByText('Generate API Key')).not.toBeInTheDocument();
    expect(screen.queryByText('Copy API Key')).not.toBeInTheDocument();
  });

  it('should expand when Setup Instructions button is clicked', () => {
    render(<InstructionCard provider={mockProviderData} />);
    
    const expandButton = screen.getByText('Setup Instructions');
    fireEvent.click(expandButton);
    
    // Steps should now be visible
    expect(screen.getByText('Create OpenAI Account')).toBeInTheDocument();
    expect(screen.getByText('Generate API Key')).toBeInTheDocument();
    expect(screen.getByText('Copy API Key')).toBeInTheDocument();
    
    // Check step descriptions
    expect(screen.getByText('Visit the OpenAI platform and sign up for an account.')).toBeInTheDocument();
    expect(screen.getByText('Navigate to the API keys section and create a new API key.')).toBeInTheDocument();
    expect(screen.getByText('Copy the generated API key and paste it in the field above.')).toBeInTheDocument();
    
    // Check step actions
    expect(screen.getByText('Sign up at platform.openai.com')).toBeInTheDocument();
    expect(screen.getByText('Click "Create new secret key"')).toBeInTheDocument();
    expect(screen.getByText('Copy the key starting with "sk-"')).toBeInTheDocument();
  });

  it('should collapse when clicked again', () => {
    render(<InstructionCard provider={mockProviderData} />);
    
    const expandButton = screen.getByText('Setup Instructions');
    
    // Expand
    fireEvent.click(expandButton);
    expect(screen.getByText('Create OpenAI Account')).toBeInTheDocument();
    
    // Collapse
    fireEvent.click(expandButton);
    expect(screen.queryByText('Create OpenAI Account')).not.toBeInTheDocument();
  });

  it('should render step numbers correctly', () => {
    render(<InstructionCard provider={mockProviderData} />);
    
    const expandButton = screen.getByText('Setup Instructions');
    fireEvent.click(expandButton);
    
    // Check that step numbers are rendered
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render "Get API Key" link correctly', () => {
    render(<InstructionCard provider={mockProviderData} />);
    
    const apiKeyLink = screen.getByRole('link', { name: /get api key/i });
    expect(apiKeyLink).toBeInTheDocument();
    expect(apiKeyLink).toHaveAttribute('href', 'https://platform.openai.com/api-keys');
    expect(apiKeyLink).toHaveAttribute('target', '_blank');
    expect(apiKeyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should handle providers with different numbers of steps', () => {
    const shortProviderData = {
      ...mockProviderData,
      steps: [
        {
          step: 1,
          title: 'Single Step',
          description: 'This provider only has one step.',
          action: 'Do this action'
        }
      ]
    };
    
    render(<InstructionCard provider={shortProviderData} />);
    
    const expandButton = screen.getByText('Setup Instructions');
    fireEvent.click(expandButton);
    
    expect(screen.getByText('Single Step')).toBeInTheDocument();
    expect(screen.getByText('This provider only has one step.')).toBeInTheDocument();
    expect(screen.getByText('Do this action')).toBeInTheDocument();
    
    // Should not render steps 2 and 3
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('should apply correct styling classes', () => {
    render(<InstructionCard provider={mockProviderData} />);
    
    // Check that the card has the correct base styling
    const card = screen.getByRole('article');
    expect(card).toHaveClass('bg-white', 'border', 'rounded-lg', 'p-6', 'mb-6');
    
    // Check expand button styling
    const expandButton = screen.getByText('Setup Instructions');
    expect(expandButton).toHaveClass('text-blue-600', 'hover:text-blue-700');
  });

  it('should show/hide chevron icon correctly', () => {
    render(<InstructionCard provider={mockProviderData} />);
    
    const expandButton = screen.getByText('Setup Instructions');
    
    // Should have chevron down initially (collapsed state)
    let chevronIcon = expandButton.querySelector('svg');
    expect(chevronIcon).toBeInTheDocument();
    
    // Expand
    fireEvent.click(expandButton);
    
    // Chevron should rotate (expanded state)
    chevronIcon = expandButton.querySelector('svg');
    expect(chevronIcon).toBeInTheDocument();
    expect(chevronIcon?.closest('button')).toContainHTML('transform');
  });

  it('should handle empty or undefined provider data gracefully', () => {
    const emptyProvider = {
      name: '',
      description: '',
      setupTime: '',
      cost: '',
      keyFormat: '',
      getKeyUrl: '',
      steps: []
    };
    
    render(<InstructionCard provider={emptyProvider} />);
    
    // Should render without crashing
    expect(screen.getByText('Setup Instructions')).toBeInTheDocument();
    
    // Expand should not show any steps
    const expandButton = screen.getByText('Setup Instructions');
    fireEvent.click(expandButton);
    
    // No steps should be rendered
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});