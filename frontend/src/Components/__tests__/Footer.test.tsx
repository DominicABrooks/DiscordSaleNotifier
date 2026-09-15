import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders the copyright notice and Discord link', () => {
    render(<Footer />);

    expect(screen.getByText(/2026 Steam Sale Notifier/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://discord.com');
    expect(screen.getByAltText('Discord')).toBeInTheDocument();
  });
});
