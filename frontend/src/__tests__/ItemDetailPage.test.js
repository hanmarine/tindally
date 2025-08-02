import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import ItemDetailPage from "@/app/item/[id]/page";
import "@testing-library/jest-dom";

global.fetch = require("jest-fetch-mock");

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: "1" }),
}));

describe("ItemDetailPage", () => {
  beforeEach(() => {
    fetch.resetMocks();
    mockPush.mockReset();
  });

  // Test for updating an item
  test("User can update an item", async () => {
    const initialItem = {
      id: 1,
      name: "Old Name",
      description: "Old Desc",
      price: 10,
    };

    const updatedItem = {
      ...initialItem,
      name: "New Name",
      description: "New Desc",
    };

    fetch.mockResponseOnce(JSON.stringify(initialItem));
    render(<ItemDetailPage />);
    await screen.findByText(/Old Name/i);

    fireEvent.click(screen.getByRole("button", { name: /Edit Item/i }));

    fireEvent.change(screen.getByLabelText(/Item Name/i), {
      target: { value: updatedItem.name },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: updatedItem.description },
    });

    fetch.mockResponseOnce(JSON.stringify(updatedItem));
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    const successDialog = await screen.findByRole("dialog", {
      name: /Success!/i,
    });
    fireEvent.click(within(successDialog).getByRole("button", { name: /OK/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  // Test for deleting an item
  test("User can delete an item and be redirected", async () => {
    const item = { id: 1, name: "Delete Me", description: "Desc", price: 5 };

    fetch.mockResponseOnce(JSON.stringify(item));
    render(<ItemDetailPage />);
    await screen.findByText(/Delete Me/i);

    fireEvent.click(screen.getByRole("button", { name: /Delete Item/i }));
    const confirmDialog = await screen.findByRole("dialog", {
      name: /Confirm Deletion/i,
    });

    fetch.mockResponseOnce("", { status: 204 });
    fireEvent.click(
      within(confirmDialog).getByRole("button", { name: /Delete/i })
    );

    const successDialog = await screen.findByRole("dialog", {
      name: /Success!/i,
    });
    fireEvent.click(within(successDialog).getByRole("button", { name: /OK/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
