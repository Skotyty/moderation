import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies default variant styles', () => {
    render(<Button>Default</Button>);
    const button = screen.getByText('Default');
    expect(button).toHaveClass('bg-primary');
  });

  it('applies destructive variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByText('Outline');
    expect(button).toHaveClass('border');
  });

  it('applies success variant styles', () => {
    render(<Button variant="success">Success</Button>);
    const button = screen.getByText('Success');
    expect(button).toHaveClass('bg-green-600');
  });

  it('applies warning variant styles', () => {
    render(<Button variant="warning">Warning</Button>);
    const button = screen.getByText('Warning');
    expect(button).toHaveClass('bg-yellow-600');
  });

  it('applies small size styles', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByText('Small');
    expect(button).toHaveClass('h-9');
  });

  it('applies large size styles', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText('Large');
    expect(button).toHaveClass('h-11');
  });

  it('applies icon size styles', () => {
    render(<Button size="icon" aria-label="icon button">X</Button>);
    const button = screen.getByLabelText('icon button');
    expect(button).toHaveClass('h-10', 'w-10');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText('Custom');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Test</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it('prevents click when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    await user.click(screen.getByText('Disabled'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as button element', () => {
    render(<Button>Button</Button>);
    const button = screen.getByText('Button');
    expect(button.tagName).toBe('BUTTON');
  });
});



