import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles text input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('calls onChange handler', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(<Input onChange={handleChange} placeholder="Type" />);
    
    const input = screen.getByPlaceholderText('Type');
    await user.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('accepts different input types', () => {
    const { rerender } = render(<Input type="text" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
    
    rerender(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    
    rerender(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    
    rerender(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
  });

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-input');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('applies default styles', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('rounded-md', 'border', 'bg-background');
  });

  it('shows placeholder text', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('accepts default value', () => {
    render(<Input defaultValue="Initial value" data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('Initial value');
  });

  it('accepts controlled value', () => {
    const { rerender } = render(<Input value="Controlled" onChange={() => {}} data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('Controlled');
    
    rerender(<Input value="Updated" onChange={() => {}} data-testid="input" />);
    expect(input.value).toBe('Updated');
  });

  it('supports maxLength attribute', () => {
    render(<Input maxLength={10} data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('supports required attribute', () => {
    render(<Input required data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeRequired();
  });
});



