import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies default styles', () => {
      render(<Card data-testid="card">Card</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card');
    });

    it('applies custom className', () => {
      render(
        <Card className="custom-card" data-testid="card">
          Card
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('CardHeader', () => {
    it('renders header with children', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('applies default styles', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex', 'flex-col', 'p-6');
    });
  });

  describe('CardTitle', () => {
    it('renders title as h3', () => {
      render(<CardTitle>Card Title</CardTitle>);
      const title = screen.getByText('Card Title');
      expect(title.tagName).toBe('H3');
    });

    it('applies title styles', () => {
      render(<CardTitle>Card Title</CardTitle>);
      const title = screen.getByText('Card Title');
      expect(title).toHaveClass('text-2xl', 'font-semibold');
    });
  });

  describe('CardDescription', () => {
    it('renders description as paragraph', () => {
      render(<CardDescription>Card description</CardDescription>);
      const desc = screen.getByText('Card description');
      expect(desc.tagName).toBe('P');
    });

    it('applies description styles', () => {
      render(<CardDescription>Card description</CardDescription>);
      const desc = screen.getByText('Card description');
      expect(desc).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('CardContent', () => {
    it('renders content with children', () => {
      render(<CardContent>Content area</CardContent>);
      expect(screen.getByText('Content area')).toBeInTheDocument();
    });

    it('applies content styles', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6', 'pt-0');
    });
  });

  describe('CardFooter', () => {
    it('renders footer with children', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('applies footer styles', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6');
    });
  });

  describe('Complete Card', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Test Footer')).toBeInTheDocument();
    });
  });
});



