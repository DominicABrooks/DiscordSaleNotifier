import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import AddTrackingForm from '../AddTrackingForm';

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
const CREATE_PATH = '/api/webhook/create';

const mockFetchFor = (options: { webhookOk?: boolean; apiOk?: boolean; apiError?: string } = {}): void => {
  const { webhookOk = true, apiOk = true, apiError } = options;
  fetchMock().mockImplementation((url: string) =>
    String(url).includes(CREATE_PATH)
      ? Promise.resolve({
          ok: apiOk,
          json: async () => (apiError ? { error: apiError } : {}),
        } as Response)
      : Promise.resolve({ ok: webhookOk } as Response)
  );
};

const submitValidUrl = (): void => {
  fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: VALID_URL } });
  fireEvent.click(screen.getByRole('button', { name: /start tracking!/i }));
};

describe('AddTrackingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    mockFetchFor();
  });

  it('renders the shared tracking form in add mode', () => {
    render(<AddTrackingForm />);

    expect(document.getElementById('add-form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start tracking!/i })).toBeInTheDocument();
  });

  it('POSTs the webhook to the create endpoint and shows a success toast', async () => {
    render(<AddTrackingForm />);
    submitValidUrl();

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('Webhook added successfully!', {
      position: 'top-right',
    }));

    const createCall = fetchMock().mock.calls.find(([url]) => String(url).includes(CREATE_PATH));
    expect(createCall).toBeDefined();
    expect(createCall?.[0]).toBe('/api/webhook/create');
    expect(createCall?.[1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(JSON.parse(createCall?.[1].body as string)).toEqual({ webhook: VALID_URL });
  });

  it('surfaces the API error message when creation fails', async () => {
    mockFetchFor({ apiOk: false, apiError: 'Webhook already exists' });
    render(<AddTrackingForm />);
    submitValidUrl();

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Webhook already exists', {
      position: 'top-right',
    }));
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('falls back to a default message when creation fails without details', async () => {
    mockFetchFor({ apiOk: false });
    render(<AddTrackingForm />);
    submitValidUrl();

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Failed to create webhook', {
      position: 'top-right',
    }));
  });

  it('shows an error toast when the create request throws', async () => {
    fetchMock().mockImplementation((url: string) =>
      String(url).includes(CREATE_PATH)
        ? Promise.reject(new Error('Network down'))
        : Promise.resolve({ ok: true } as Response)
    );
    render(<AddTrackingForm />);
    submitValidUrl();

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Network down', {
      position: 'top-right',
    }));
  });

  it('never calls the create endpoint when webhook verification fails', async () => {
    mockFetchFor({ webhookOk: false });
    render(<AddTrackingForm />);
    submitValidUrl();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Failed to fetch webhook URL', { position: 'top-right' })
    );
    expect(fetchMock().mock.calls.some(([url]) => String(url).includes(CREATE_PATH))).toBe(false);
  });
});

describe('AddTrackingForm API configuration', () => {
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
    render(<AddTrackingForm />);
    submitValidUrl();
    await waitFor(() => expect(fetchMock().mock.calls.some((call) => String(call[0]) === 'https://api.example.com/api/webhook/create')).toBe(true));
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('Webhook added successfully!', { position: 'top-right' }));
    delete process.env.REACT_APP_API_URL;
  });


  it('surfaces the default message when creation rejects with a non-error', async () => {
    fetchMock().mockImplementation((url: string) =>
      String(url).includes(CREATE_PATH)
        ? Promise.reject('boom-string')
        : Promise.resolve({ ok: true } as Response)
    );
    render(<AddTrackingForm />);
    submitValidUrl();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Failed to create webhook', {
        position: 'top-right',
      })
    );
  });
});
