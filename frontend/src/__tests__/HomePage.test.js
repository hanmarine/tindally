import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { waitForElementToBeRemoved } from "@testing-library/react";
import ItemsPage from "../app/page";

jest.mock("next/link", () => ({ children }) => <>{children}</>);
const mockRouter = { push: jest.fn(), replace: jest.fn() };
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

describe("ItemsPage", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  test("renders ItemsPage and shows item list", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        { id: 1, name: "Canned Tuna", description: "Desc", price: 10 },
      ])
    );

    render(<ItemsPage />);

    await waitForElementToBeRemoved(() =>
      screen.queryByText(/Loading items.../i)
    );

    const itemElement = await screen.findByText(/Canned Tuna/);
    expect(itemElement).toBeInTheDocument();
  }, 10000);
});
