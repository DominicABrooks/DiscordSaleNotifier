import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import App from '../App';

jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const toastSuccess = toast.success as unknown as jest.Mock;
const fetchMock = () => global.fetch as unknown as jest.Mock;

const VALID_URL = 'https://discord.com/api/webhooks/123456789012345678/valid-token-value';
const PLACEHOLDER = 'https://discord.com/api/webhooks/...';

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation((url: string) =>
      String(url).includes('/api/webhook/')
        ? Promise.resolve({ ok: true, json: async () => ({}) } as Response)
        : Promise.resolve({ ok: true } as Response)
    );
  });

  it('renders the header, tab navigation, both tracking forms, footer, and toast container', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Steam Sale Notifier' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Add Tracking' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Delete Tracking' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start tracking!/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove tracking!/i })).toBeInTheDocument();
    expect(screen.getByText(/2026 Steam Sale Notifier/)).toBeInTheDocument();
    expect(document.querySelector('.Toastify')).toBeInTheDocument();
  });

  it('starts on the Add Tracking tab and switches to Delete Tracking and back', () => {
    render(<App />);
    const addTab = screen.getByRole('tab', { name: 'Add Tracking' });
    const deleteTab = screen.getByRole('tab', { name: 'Delete Tracking' });

    expect(addTab).toHaveAttribute('aria-selected', 'true');
    expect(deleteTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(deleteTab);
    expect(deleteTab).toHaveAttribute('aria-selected', 'true');
    expect(addTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(addTab);
    expect(addTab).toHaveAttribute('aria-selected', 'true');
    expect(deleteTab).toHaveAttribute('aria-selected', 'false');
  });

  it('completes the add-tracking flow through the wired form and API', async () => {
    render(<App />);

    const addInput = screen.getAllByPlaceholderText(PLACEHOLDER)[0];
    fireEvent.change(addInput, { target: { value: VALID_URL } });
    fireEvent.click(screen.getByRole('button', { name: /start tracking!/i }));

    await waitFor(() =>
      expect(fetchMock().mock.calls.some(([url]) => String(url).includes('/api/webhook/create'))).toBe(true)
    );
    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith('Webhook added successfully!', {
        position: 'top-right',
      })
    );
  });

  it('completes the delete-tracking flow through the wired form and API', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('tab', { name: 'Delete Tracking' }));
    const deleteInput = screen.getAllByPlaceholderText(PLACEHOLDER)[1];
    fireEvent.change(deleteInput, { target: { value: VALID_URL } });
    fireEvent.click(screen.getByRole('button', { name: /remove tracking!/i }));

    await waitFor(() =>
      expect(fetchMock().mock.calls.some(([url]) => String(url).includes('/api/webhook/delete'))).toBe(true)
    );
    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith('Webhook deleted successfully!', {
        position: 'top-right',
      })
    );
  });
});
