import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

describe('Select', () => {
  const renderSelectWithOptions = (props = {}) => {
    return render(
      <Select {...props}>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </Select>
    );
  };

  it('renders select element with options', () => {
    renderSelectWithOptions();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('displays all options', () => {
    renderSelectWithOptions();
    
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
  });

  it('handles onChange event', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    renderSelectWithOptions({ onChange: handleChange });
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'option2');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('sets default value', () => {
    renderSelectWithOptions({ value: 'option2', onChange: () => {} });
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });

  it('can be disabled', () => {
    renderSelectWithOptions({ disabled: true });
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('applies custom className', () => {
    renderSelectWithOptions({ className: 'custom-select' });
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-select');
  });

  it('renders children correctly', () => {
    render(
      <Select>
        <option value="">Choose an option</option>
        <option value="1">One</option>
      </Select>
    );
    
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
    expect(screen.getByText('One')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    renderSelectWithOptions();
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('rounded-md', 'border');
  });
});

