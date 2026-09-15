import { fireEvent, render, screen } from "@testing-library/react";
import CardTabs from "../CardTabs";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe("CardTabs", () => {
  it("renders the add and delete tabs with both tracking forms", () => {
    render(<CardTabs />);

    expect(screen.getByRole("tab", { name: "Add Tracking" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Delete Tracking" })).toBeInTheDocument();
    expect(document.getElementById("add-form")).toBeInTheDocument();
    expect(document.getElementById("delete-form")).toBeInTheDocument();
  });

  it("starts on the Add Tracking tab and switches to Delete Tracking", () => {
    render(<CardTabs />);

    const addTab = screen.getByRole("tab", { name: "Add Tracking" });
    const deleteTab = screen.getByRole("tab", { name: "Delete Tracking" });

    expect(addTab).toHaveAttribute("aria-selected", "true");

    fireEvent.click(deleteTab);

    expect(deleteTab).toHaveAttribute("aria-selected", "true");
    expect(addTab).toHaveAttribute("aria-selected", "false");
  });
});
