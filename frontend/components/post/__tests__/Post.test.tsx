import { render, screen } from "@testing-library/react";
import Post from "../Post";
import "@testing-library/jest-dom";

describe("Post", () => {
  it("renders a basic post", () => {
    render(<Post modal={false} />);

    expect(
      screen.getByPlaceholderText("What's happening?!"),
    ).toBeInTheDocument();
  });
});
