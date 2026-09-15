import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('renders the app title, tagline, and logo', () => {
    render(<Header />);

    expect(screen.getByRole('heading', { name: 'Steam Sale Notifier' })).toBeInTheDocument();
    expect(
      screen.getByText('Stay updated with Discord notifications for new Steam sales!')
    ).toBeInTheDocument();
    expect(screen.getByAltText('Logo')).toHaveAttribute('src', 'logo.png');
  });
});
