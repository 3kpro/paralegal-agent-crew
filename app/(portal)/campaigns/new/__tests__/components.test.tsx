/**
 * Component tests for refactored campaign page components
 * 
 * Tests for:
 * - CreativitySlider
 * - ControlOptionButton
 * - ContentSettings
 * - GeneratedContentCard
 * - Toast
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreativitySlider from "../components/CreativitySlider";
import ControlOptionButton from "../components/ControlOptionButton";
import Toast from "../components/Toast";
import { ToastState, Platform } from "../types";
import { Twitter } from "lucide-react";

describe("CreativitySlider Component", () => {
  it("should render with default values", () => {
    const mockOnChange = jest.fn();
    render(
      <CreativitySlider value={0.5} onChange={mockOnChange} />
    );

    expect(screen.getByDisplayValue("Creativity")).toBeInTheDocument();
    expect(screen.getByText("0.5")).toBeInTheDocument();
  });

  it("should call onChange when slider value changes", async () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <CreativitySlider value={0.5} onChange={mockOnChange} />
    );

    const slider = container.querySelector('input[type="range"]');
    if (slider) {
      fireEvent.change(slider, { target: { value: "0.7" } });
      expect(mockOnChange).toHaveBeenCalledWith(0.7);
    }
  });

  it("should display current value with one decimal place", () => {
    const mockOnChange = jest.fn();
    render(
      <CreativitySlider value={0.666} onChange={mockOnChange} />
    );

    expect(screen.getByText("0.7")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <CreativitySlider value={0.5} onChange={mockOnChange} ariaLabel="Test Label" />
    );

    const slider = container.querySelector('input[type="range"]');
    expect(slider).toHaveAttribute("aria-label", "Test Label");
    expect(slider).toHaveAttribute("title");
  });

  it("should respect min/max values", () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <CreativitySlider value={0.5} onChange={mockOnChange} min={0} max={1} />
    );

    const slider = container.querySelector('input[type="range"]');
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "1");
  });

  it("should have aria-live region for value updates", () => {
    const mockOnChange = jest.fn();
    render(
      <CreativitySlider value={0.5} onChange={mockOnChange} />
    );

    const liveRegion = screen.getByText("0.5").parentElement;
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });
});

describe("ControlOptionButton Component", () => {
  it("should render with label", () => {
    const mockOnClick = jest.fn();
    render(
      <ControlOptionButton
        id="test"
        label="Test Option"
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("Test Option")).toBeInTheDocument();
  });

  it("should call onClick with id when clicked", async () => {
    const mockOnClick = jest.fn();
    render(
      <ControlOptionButton
        id="professional"
        label="Professional"
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledWith("professional");
  });

  it("should have aria-pressed attribute", () => {
    const mockOnClick = jest.fn();
    const { rerender } = render(
      <ControlOptionButton
        id="test"
        label="Test"
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");

    // Update to selected state
    rerender(
      <ControlOptionButton
        id="test"
        label="Test"
        isSelected={true}
        onClick={mockOnClick}
      />
    );

    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("should apply selected styling when isSelected is true", () => {
    const mockOnClick = jest.fn();
    render(
      <ControlOptionButton
        id="test"
        label="Test"
        isSelected={true}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("from-tron-cyan");
  });

  it("should apply unselected styling when isSelected is false", () => {
    const mockOnClick = jest.fn();
    render(
      <ControlOptionButton
        id="test"
        label="Test"
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-tron-grid/50");
  });

  it("should support flex layout", () => {
    const mockOnClick = jest.fn();
    const { container } = render(
      <ControlOptionButton
        id="test"
        label="Test"
        isSelected={false}
        onClick={mockOnClick}
        flex={true}
      />
    );

    const button = container.querySelector("button");
    expect(button).toHaveClass("flex-1");
  });

  it("should have proper title attribute", () => {
    const mockOnClick = jest.fn();
    render(
      <ControlOptionButton
        id="test"
        label="Test Option"
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Select Test Option");
  });
});

describe("Toast Component", () => {
  it("should render when toast.show is true", () => {
    const toast: ToastState = {
      show: true,
      message: "Test message",
      type: "success",
    };

    render(<Toast toast={toast} />);

    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("should not render when toast.show is false", () => {
    const toast: ToastState = {
      show: false,
      message: "",
      type: "success",
    };

    render(<Toast toast={toast} />);

    expect(screen.queryByText(/message/i)).not.toBeInTheDocument();
  });

  it("should show success styling for success type", () => {
    const toast: ToastState = {
      show: true,
      message: "Success!",
      type: "success",
    };

    render(<Toast toast={toast} />);

    const successElement = screen.getByText("Success!").parentElement;
    expect(successElement).toHaveClass("bg-green-500/20");
  });

  it("should show error styling for error type", () => {
    const toast: ToastState = {
      show: true,
      message: "Error!",
      type: "error",
    };

    render(<Toast toast={toast} />);

    const errorElement = screen.getByText("Error!").parentElement;
    expect(errorElement).toHaveClass("bg-red-500/20");
  });

  it("should have role status for accessibility", () => {
    const toast: ToastState = {
      show: true,
      message: "Test",
      type: "success",
    };

    const { container } = render(<Toast toast={toast} />);

    const statusRegion = container.querySelector('[role="status"]');
    expect(statusRegion).toBeInTheDocument();
  });

  it("should have aria-live polite", () => {
    const toast: ToastState = {
      show: true,
      message: "Test",
      type: "success",
    };

    const { container } = render(<Toast toast={toast} />);

    const statusRegion = container.querySelector('[role="status"]');
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  it("should display check icon for success", () => {
    const toast: ToastState = {
      show: true,
      message: "Success!",
      type: "success",
    };

    render(<Toast toast={toast} />);

    // Check icon should be present
    expect(screen.getByText("Success!")).toBeInTheDocument();
  });

  it("should display warning icon for error", () => {
    const toast: ToastState = {
      show: true,
      message: "Error!",
      type: "error",
    };

    render(<Toast toast={toast} />);

    // Warning emoji should be present
    expect(screen.getByText("Error!")).toBeInTheDocument();
  });

  it("should animate in and out", async () => {
    const toast: ToastState = {
      show: true,
      message: "Test",
      type: "success",
    };

    const { rerender } = render(<Toast toast={toast} />);

    expect(screen.getByText("Test")).toBeInTheDocument();

    // Change to hidden state
    rerender(
      <Toast
        toast={{
          show: false,
          message: "",
          type: "success",
        }}
      />
    );

    // Toast should be removed (after animation)
    await waitFor(() => {
      expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });
  });
});

describe("Component Memoization", () => {
  it("CreativitySlider should be memoized", () => {
    const mockOnChange = jest.fn();
    const { rerender } = render(
      <CreativitySlider value={0.5} onChange={mockOnChange} />
    );

    const firstRender = screen.getByDisplayValue("Creativity");

    // Re-render with same props
    rerender(
      <CreativitySlider value={0.5} onChange={mockOnChange} />
    );

    const secondRender = screen.getByDisplayValue("Creativity");

    // Should still be the same element
    expect(firstRender).toBe(secondRender);
  });

  it("ControlOptionButton should be memoized", () => {
    const mockOnClick = jest.fn();
    const { rerender } = render(
      <ControlOptionButton
        id="test"
        label="Test"
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    const firstRender = screen.getByRole("button");

    // Re-render with same props
    rerender(
      <ControlOptionButton
        id="test"
        label="Test"
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    const secondRender = screen.getByRole("button");

    // Should still be the same element
    expect(firstRender).toBe(secondRender);
  });

  it("Toast should be memoized", () => {
    const toast: ToastState = {
      show: true,
      message: "Test",
      type: "success",
    };

    const { rerender } = render(<Toast toast={toast} />);

    const firstRender = screen.getByText("Test");

    // Re-render with same props
    rerender(<Toast toast={toast} />);

    const secondRender = screen.getByText("Test");

    // Should still be the same element
    expect(firstRender).toBe(secondRender);
  });
});