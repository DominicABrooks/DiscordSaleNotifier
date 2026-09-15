import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import DeleteTrackingForm from '../DeleteTrackingForm';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const toastSuccess = toast.success as unknown as jest.Mock;
const toastError = toast.error as unknown as jest.Mock;
const fetchMock = () => global.fetch as unknown as jest.Mock;

const VALID_URL = 'https://discord.com/api/webhooks/123456789012345678/valid-token-value';
const PLACEHOLDER = 'https://discord.com/api/webhooks/...';
const DELETE_PATH = '/api/webhook/delete';

const mockFetchFor = (options: { webhookOk?: boolean; apiOk?: boolean; apiError?: string } = {}): void => {
  const { webhookOk = true, apiOk = true, apiError } = options;
  fetchMock().mockImplementation((url: string) =>
    String(url).includes(DELETE_PATH)
      ? Promise.resolve({
          ok: apiOk,
          json: async () => (apiError ? { error: apiError } : {}),
        } as Response)
      : Promise.resolve({ ok: webhookOk } as Response)
  );
};

const submitValidUrl = (): void => {
  fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: VALID_URL } });
  fireEvent.click(screen.getByRole('button', { name: /remove tracking!/i }));
};

describe('DeleteTrackingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    mockFetchFor();
  });

  it('renders the shared tracking form in delete mode', () => {
    render(<DeleteTrackingForm />);

    expect(document.getElementById('delete-form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove tracking!/i })).toBeInTheDocument();
  });

  it('DELETEs the webhook and shows a success toast', async () => {
    render(<DeleteTrackingForm />);
    submitValidUrl();

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('Webhook deleted successfully!', {
      position: 'top-right',
    }));

    const deleteCall = fetchMock().mock.calls.find(([url]) => String(url).includes(DELETE_PATH));
    expect(deleteCall).toBeDefined();
    expect(deleteCall?.[0]).toBe('/api/webhook/delete');
    expect(deleteCall?.[1]).toMatchObject({
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(JSON.parse(deleteCall?.[1].body as string)).toEqual({ webhook: VALID_URL });
  });

  it('surfaces the API error message when deletion fails', async () => {
    mockFetchFor({ apiOk: false, apiError: 'Webhook not found' });
    render(<DeleteTrackingForm />);
    submitValidUrl();

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Webhook not found', {
      position: 'top-right',
    }));
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('falls back to a default message when deletion fails without details', async () => {
    mockFetchFor({ apiOk: false });
    render(<DeleteTrackingForm />);
    submitValidUrl();

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Failed to delete webhook', {
      position: 'top-right',
    }));
  });

  it('shows an error toast when the delete request throws', async () => {
    fetchMock().mockImplementation((url: string) =>
      String(url).includes(DELETE_PATH)
        ? Promise.reject(new Error('Network down'))
        : Promise.resolve({ ok: true } as Response)
    );
    render(<DeleteTrackingForm />);
    submitValidUrl();

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Network down', {
      position: 'top-right',
    }));
  });

  it('never calls the delete endpoint when webhook verification fails', async () => {
    mockFetchFor({ webhookOk: false });
    render(<DeleteTrackingForm />);
    submitValidUrl();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Failed to fetch webhook URL', { position: 'top-right' })
    );
    expect(fetchMock().mock.calls.some(([url]) => String(url).includes(DELETE_PATH))).toBe(false);
  });
});

describe('DeleteTrackingForm API configuration', () => {
  const previousApiUrl = process.env.REACT_APP_API_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response)
    );
  });

  afterEach(() => {
    if (previousApiUrl === undefined) {
      delete process.env.REACT_APP_API_URL;
    } else {
      process.env.REACT_APP_API_URL = previousApiUrl;
    }
  });

  it('prefixes API calls with REACT_APP_API_URL when configured', async () => {
    process.env.REACT_APP_API_URL = 'https://api.example.com';
    render(<DeleteTrackingForm />);
    submitValidUrl();
    await waitFor(() => expect(fetchMock().mock.calls.some((call) => String(call[0]) === 'https://api.example.com/api/webhook/delete')).toBe(true));
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('Webhook deleted successfully!', { position: 'top-right' }));
    delete process.env.REACT_APP_API_URL;
  });


  it('surfaces the default message when deletion rejects with a non-error', async () => {
    fetchMock().mockImplementation((url: string) =>
      String(url).includes(DELETE_PATH)
        ? Promise.reject('boom-string')
        : Promise.resolve({ ok: true } as Response)
    );
    render(<DeleteTrackingForm />);
    submitValidUrl();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Failed to delete webhook', {
        position: 'top-right',
      })
    );
  });
});
