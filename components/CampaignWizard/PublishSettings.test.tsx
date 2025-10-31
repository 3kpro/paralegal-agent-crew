import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PublishSettings } from "./PublishSettings";
import "@testing-library/jest-dom";

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => ({
          data: { is_active: true },
          error: null,
        })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: { id: "test-campaign-id" },
          error: null,
        })),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  })),
};

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
  } as Response),
);

// Mock window.location
const mockAssign = jest.fn();
Object.defineProperty(window, "location", {
  value: { assign: mockAssign, origin: "http://localhost:3000" },
  writable: true,
});

describe("PublishSettings", () => {
  const defaultProps = {
    settings: {},
    onChange: jest.fn(),
    onBack: jest.fn(),
    campaignData: {
      content: "Test content",
      style: "modern",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders platform selection button", () => {
    render(<PublishSettings {...defaultProps} />);

    expect(screen.getByTestId("platform-button-twitter")).toBeInTheDocument();
  });

  it("shows error when trying to publish without selecting platforms", async () => {
    render(<PublishSettings {...defaultProps} />);

    const publishButton = screen.getByTestId("publish-button");
    expect(publishButton).toBeDisabled();

    fireEvent.click(publishButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId("error-message");
      expect(errorMessage).toHaveTextContent(
        "Please select at least one platform",
      );
    });
  });

  it("selects and deselects platform when already connected", async () => {
    render(<PublishSettings {...defaultProps} />);

    const twitterButton = screen.getByTestId("platform-button-twitter");

    // Click Twitter button
    fireEvent.click(twitterButton);

    await waitFor(() => {
      expect(twitterButton).toHaveAttribute("aria-pressed", "true");
      expect(twitterButton).toHaveAttribute(
        "data-testid",
        "platform-button-twitter",
      );
    });

    // Click again to deselect
    fireEvent.click(twitterButton);

    await waitFor(() => {
      expect(twitterButton).toHaveAttribute("aria-pressed", "false");
      expect(twitterButton).toHaveAttribute(
        "data-testid",
        "platform-button-twitter",
      );
    });
  });

  it("initiates OAuth flow for unconnected platforms", async () => {
    // Mock Supabase to return no active account
    mockSupabase.from.mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { is_active: false } as any,
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: "test-campaign-id" },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    }));

    process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID = "twitter-client-id";

    render(<PublishSettings {...defaultProps} />);

    // Click Twitter button
    const twitterButton = screen.getByTestId("platform-button-twitter");
    fireEvent.click(twitterButton);

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(
        expect.stringContaining("twitter.com/i/oauth2/authorize"),
      );
      expect(window.location.assign).toHaveBeenCalledWith(
        expect.stringContaining("client_id=twitter-client-id"),
      );
    });
  });

  it("successfully publishes when platforms are selected", async () => {
    render(<PublishSettings {...defaultProps} />);

    // Select Twitter
    const twitterButton = screen.getByTestId("platform-button-twitter");
    fireEvent.click(twitterButton);

    await waitFor(() => {
      expect(twitterButton).toHaveAttribute("aria-pressed", "true");
    });

    // Click publish
    const publishButton = screen.getByTestId("publish-button");
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(
        "/campaigns/test-campaign-id/success",
      );
    });
  });

  it("handles publishing errors gracefully", async () => {
    // Mock fetch to return error
    jest.mocked(global.fetch).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      } as Response),
    );

    render(<PublishSettings {...defaultProps} />);

    // Select Twitter
    const twitterButton = screen.getByTestId("platform-button-twitter");
    fireEvent.click(twitterButton);

    await waitFor(() => {
      expect(twitterButton).toHaveAttribute("aria-pressed", "true");
    });

    // Click publish
    const publishButton = screen.getByTestId("publish-button");
    fireEvent.click(publishButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId("error-message");
      expect(errorMessage).toHaveTextContent("Failed to publish to twitter");
    });
  });

  it("shows loading state while publishing", async () => {
    render(<PublishSettings {...defaultProps} />);

    // Select Twitter
    const twitterButton = screen.getByTestId("platform-button-twitter");
    fireEvent.click(twitterButton);

    await waitFor(() => {
      expect(twitterButton).toHaveAttribute("aria-pressed", "true");
    });

    // Click publish
    const publishButton = screen.getByTestId("publish-button");
    fireEvent.click(publishButton);

    await waitFor(() => {
      const loaderIcon = screen.getByTestId("loading-spinner");
      expect(loaderIcon).toBeInTheDocument();
      expect(screen.getByTestId("publish-button")).toHaveTextContent(
        "Publishing...",
      );
      expect(screen.getByTestId("publish-button")).toBeDisabled();
    });
  });

  it("navigates back when back button is clicked", () => {
    render(<PublishSettings {...defaultProps} />);

    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it("handles connection errors gracefully", async () => {
    // Mock Supabase to throw error
    mockSupabase.from.mockImplementationOnce(() => {
      throw new Error("Connection failed");
    });

    render(<PublishSettings {...defaultProps} />);

    // Click Twitter button
    const twitterButton = screen.getByTestId("platform-button-twitter");
    fireEvent.click(twitterButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId("error-message");
      expect(errorMessage).toHaveTextContent("Failed to connect to platform");
    });
  });
});
