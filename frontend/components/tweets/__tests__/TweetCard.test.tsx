import { render, screen, fireEvent } from "@testing-library/react";
import TweetCard from "../index";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { getMockTweet } from "@/__mocks__/mockTweet";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: () => ({ photoId: null }),
}));

jest.mock("@/context/authContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/lib/queries/tweets.queries", () => ({
  addView: jest.fn(),
}));

jest.mock("../TweetActions", () => () => <div data-testid="tweet-actions" />);

jest.mock("@/components/ui/user/Avatar", () => () => (
  <div data-testid="avatar" />
));

jest.mock("../TweetHoverProfile", () => () => (
  <div data-testid="tweet-hover-profile" />
));

jest.mock("@/components/ui/decorations/Spinner", () => () => (
  <div>Loading Spinner</div>
));

jest.mock(
  "@/components/ui/decorations/GeneralTooltip",
  () =>
    ({ children }: any) => <>{children}</>,
);

jest.mock(
  "@/components/shared/overlays/ErrorOverlay",
  () =>
    ({ error }: any) => <div>{error}</div>,
);

describe("TweetCard", () => {
  const mockPush = jest.fn();
  const baseTweet = getMockTweet();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({ user: { username: "testuser" } });
  });

  it("renders a basic tweet", () => {
    render(<TweetCard tweet={baseTweet} variant="default" />);
    expect(
      screen.getByText("Hello, this is a mock tweet!"),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("avatar").length).toBeGreaterThan(0);
    expect(screen.getByTestId("tweet-actions")).toBeInTheDocument();
  });

  it("calls router.push on tweet click", () => {
    render(<TweetCard tweet={baseTweet} variant="default" />);
    const card = screen
      .getByText("Hello, this is a mock tweet!")
      .closest("article");
    fireEvent.click(card!);
    expect(mockPush).toHaveBeenCalledWith("/status/1");
  });

  it("renders Spinner when loading is true", () => {
    render(<TweetCard tweet={null} variant="default" loading={true} />);
    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
  });

  it("renders TweetHoverProfile when tweet is done loading and the thingy is hovered", () => {
    render(<TweetCard tweet={baseTweet} variant="default" />);
    expect(screen.getByTestId("tweet-hover-profile")).toBeInTheDocument();
  });

  it("renders Not found when loading is false and no tweet", () => {
    render(<TweetCard tweet={null} variant="default" loading={false} />);
    expect(screen.getByText("Not found")).toBeInTheDocument();
  });
});
