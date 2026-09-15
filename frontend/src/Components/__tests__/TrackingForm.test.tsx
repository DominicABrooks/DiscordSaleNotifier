import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import TrackingForm from "../TrackingForm";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const toastError = toast.error as unknown as jest.Mock;
const fetchMock = () => global.fetch as unknown as jest.Mock;

const VALID_URL = "https://discord.com/api/webhooks/123456789012345678/valid-token-value";
const VALID_APP_URL = "https://discordapp.com/api/webhooks/123456789012345678/valid-token-value";
const INVALID_URL = "https://example.com/not-a-discord-webhook";
const PLACEHOLDER = "https://discord.com/api/webhooks/...";

const fillAndSubmit = (url: string, buttonName = /start tracking!/i): void => {
  fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: url } });
  fireEvent.click(screen.getByRole("button", { name: buttonName }));
};

describe("TrackingForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as Response);
  });

  it("renders the webhook input, help link, and add submit button", () => {
    render(<TrackingForm formType="add" onSubmitForm={jest.fn()} />);

    expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start tracking!/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start tracking!/i })).toHaveClass("btn-primary");
    expect(screen.getByRole("link", { name: /\(\?\)/ })).toHaveAttribute(
      "href",
      "https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
    );
  });

  it("renders the delete variant with danger styling", () => {
    render(<TrackingForm formType="delete" onSubmitForm={jest.fn()} />);

    const button = screen.getByRole("button", { name: /remove tracking!/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn-danger");
    expect(document.getElementById("delete-form")).toBeInTheDocument();
  });

  it("starts pristine without marking the empty input invalid", () => {
    render(<TrackingForm formType="add" onSubmitForm={jest.fn()} />);

    expect(screen.getByPlaceholderText(PLACEHOLDER)).toHaveValue("");
    expect(screen.getByPlaceholderText(PLACEHOLDER)).not.toHaveClass("is-invalid");
  });

  it("marks the input invalid once the URL stops matching the Discord webhook format", () => {
    render(<TrackingForm formType="add" onSubmitForm={jest.fn()} />);
    const input = screen.getByPlaceholderText(PLACEHOLDER);

    fireEvent.change(input, { target: { value: "not-a-webhook" } });

    expect(input).toHaveClass("is-invalid");
    expect(screen.getByText("Please provide a valid Discord Webhook URL.")).toBeInTheDocument();
  });

  it("marks an empty submit attempt invalid without fetching or delegating", async () => {
    const onSubmitForm = jest.fn();
    render(<TrackingForm formType="add" onSubmitForm={onSubmitForm} />);

    fireEvent.click(screen.getByRole("button", { name: /start tracking!/i }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Invalid Webhook", { position: "top-right" })
    );
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toHaveClass("is-invalid");
    expect(fetchMock()).not.toHaveBeenCalled();
    expect(onSubmitForm).not.toHaveBeenCalled();
  });

  it.each([
    ["discord.com URL", VALID_URL],
    ["discordapp.com URL", VALID_APP_URL],
    ["17-digit webhook id", "https://discord.com/api/webhooks/12345678901234567/token-value"],
    ["19-digit webhook id", "https://discord.com/api/webhooks/1234567890123456789/token-value"]
  ])("accepts a valid %s without marking the input invalid", (_label, url) => {
    render(<TrackingForm formType="add" onSubmitForm={jest.fn()} />);
    const input = screen.getByPlaceholderText(PLACEHOLDER);

    fireEvent.change(input, { target: { value: url } });

    expect(input).not.toHaveClass("is-invalid");
  });

  it.each([
    ["wrong domain", INVALID_URL],
    ["plain text", "not-a-webhook"],
    ["http instead of https", "http://discord.com/api/webhooks/123456789012345678/token-value"],
    ["16-digit webhook id", "https://discord.com/api/webhooks/1234567890123456/token-value"],
    ["20-digit webhook id", "https://discord.com/api/webhooks/12345678901234567890/token-value"],
    ["missing token", "https://discord.com/api/webhooks/123456789012345678"],
    ["empty value", ""]
  ])("rejects submit for %s without fetching or delegating", async (_label, url) => {
    const onSubmitForm = jest.fn();
    render(<TrackingForm formType="add" onSubmitForm={onSubmitForm} />);
    fillAndSubmit(url);

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Invalid Webhook", { position: "top-right" })
    );
    expect(fetchMock()).not.toHaveBeenCalled();
    expect(onSubmitForm).not.toHaveBeenCalled();
  });

  it("verifies the webhook with a GET request before delegating to onSubmitForm", async () => {
    const onSubmitForm = jest.fn().mockResolvedValue(undefined);
    render(<TrackingForm formType="add" onSubmitForm={onSubmitForm} />);
    fillAndSubmit(VALID_URL);

    await waitFor(() => expect(fetchMock()).toHaveBeenCalledWith(VALID_URL));
    await waitFor(() => expect(onSubmitForm).toHaveBeenCalledWith(VALID_URL));
    expect(toastError).not.toHaveBeenCalled();
  });

  it("shows an error toast and skips submit when webhook verification fails", async () => {
    fetchMock().mockResolvedValueOnce({ ok: false } as Response);
    const onSubmitForm = jest.fn();
    render(<TrackingForm formType="add" onSubmitForm={onSubmitForm} />);
    fillAndSubmit(VALID_URL);

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Failed to fetch webhook URL", { position: "top-right" })
    );
    expect(onSubmitForm).not.toHaveBeenCalled();
  });

  it("shows an error toast and skips submit when webhook verification throws", async () => {
    fetchMock().mockRejectedValueOnce(new Error("Network down"));
    const onSubmitForm = jest.fn();
    render(<TrackingForm formType="add" onSubmitForm={onSubmitForm} />);
    fillAndSubmit(VALID_URL);

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Failed to fetch webhook URL", { position: "top-right" })
    );
    expect(onSubmitForm).not.toHaveBeenCalled();
  });

  it("shows an error toast and skips submit when verification rejects with a non-error", async () => {
    fetchMock().mockRejectedValueOnce("boom-string");
    const onSubmitForm = jest.fn();
    render(<TrackingForm formType="add" onSubmitForm={onSubmitForm} />);
    fillAndSubmit(VALID_URL);

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Failed to fetch webhook URL", { position: "top-right" })
    );
    expect(onSubmitForm).not.toHaveBeenCalled();
  });

  it("disables the submit button and shows the spinner while submitting", async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmitForm = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );
    render(<TrackingForm formType="add" onSubmitForm={onSubmitForm} />);
    fillAndSubmit(VALID_URL);

    const button = screen.getByRole("button", { name: /start tracking!/i });
    const spinner = document.getElementById("add-spinner") as HTMLElement;

    await waitFor(() => expect(button).toBeDisabled());
    expect(spinner).not.toHaveClass("d-none");

    await waitFor(() => expect(onSubmitForm).toHaveBeenCalledTimes(1));
    await act(async () => {
      resolveSubmit?.();
    });

    await waitFor(() => expect(button).toBeEnabled());
    expect(spinner).toHaveClass("d-none");
    expect(onSubmitForm).toHaveBeenCalledTimes(1);
    expect(onSubmitForm).toHaveBeenCalledWith(VALID_URL);
  });

  it("clears the invalid state once the URL is corrected", () => {
    render(<TrackingForm formType="add" onSubmitForm={jest.fn()} />);
    const input = screen.getByPlaceholderText(PLACEHOLDER);

    fireEvent.change(input, { target: { value: "not-a-webhook" } });
    expect(input).toHaveClass("is-invalid");

    fireEvent.change(input, { target: { value: VALID_URL } });
    expect(input).not.toHaveClass("is-invalid");
  });
});

describe("TrackingForm extra", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as Response);
  });

  it("rejects a URL with content before the webhook pattern", async () => {
    const onSubmitForm = jest.fn();
    render(<TrackingForm formType="add" onSubmitForm={onSubmitForm} />);
    fillAndSubmit("xx" + VALID_URL);
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Invalid Webhook", { position: "top-right" })
    );
    expect(onSubmitForm).not.toHaveBeenCalled();
  });

  it("rejects a URL with trailing content after the token", async () => {
    const onSubmitForm = jest.fn();
    render(<TrackingForm formType="add" onSubmitForm={onSubmitForm} />);
    fillAndSubmit(VALID_URL + " extra");
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Invalid Webhook", { position: "top-right" })
    );
    expect(onSubmitForm).not.toHaveBeenCalled();
  });

  it("prevents native form submission", () => {
    render(<TrackingForm formType="add" onSubmitForm={jest.fn()} />);
    const form = document.getElementById("add-form") as HTMLFormElement;
    expect(fireEvent.submit(form)).toBe(false);
  });

  it("exposes stable element ids for the add variant", () => {
    render(<TrackingForm formType="add" onSubmitForm={jest.fn()} />);
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toHaveAttribute("id", "add-webhook");
    expect(document.getElementById("add-button")).toBeInTheDocument();
    expect(document.getElementById("add-spinner")).toBeInTheDocument();
  });

  it("exposes stable element ids for the delete variant", () => {
    render(<TrackingForm formType="delete" onSubmitForm={jest.fn()} />);
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toHaveAttribute("id", "delete-webhook");
    expect(document.getElementById("delete-button")).toBeInTheDocument();
    expect(document.getElementById("delete-spinner")).toBeInTheDocument();
  });
});
