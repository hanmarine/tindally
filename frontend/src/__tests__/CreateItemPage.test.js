import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import CreateItemPage from "@/app/create-item/page";
import "@testing-library/jest-dom";

global.fetch = require("jest-fetch-mock");

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Create Item Test
describe("CreateItemPage", () => {
  beforeEach(() => {
    fetch.resetMocks();
    mockPush.mockReset();
  });

  test("User can create an item and be redirected to home", async () => {
    render(<CreateItemPage />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "Test Item" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Test Description" },
    });
    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: "99.99" },
    });

    fetch.mockResponseOnce(
      JSON.stringify({
        id: 1,
        name: "Test Item",
        description: "Test Description",
        price: 99.99,
      }),
      { status: 201 }
    );

    fireEvent.click(screen.getByRole("button", { name: /Create Item/i }));

    await screen.findByText(/Item created successfully!/i);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /OK/i }));
    expect(mockPush).toHaveBeenCalledWith("/");
  }, 10000);
});
