import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const expectedLabels = [
    "Item Id",
    "Reviewer Email",
    "Stars",
    "Date Reviewed (iso format)",
    "Comments",
  ];

  test("renders correctly", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByText(/Create/);
    expectedLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("MenuItemReviewForm-id"),
    ).not.toBeInTheDocument();
  });

  test("renders correctly when passing in a MenuItemReview", async () => {
    render(
      <Router>
        <MenuItemReviewForm
          initialContents={menuItemReviewFixtures.oneMenuItemReview}
        />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-id");
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId("MenuItemReviewForm-id")).toHaveValue("1");
    expect(screen.getByTestId("MenuItemReviewForm-id")).toBeDisabled();
    expect(screen.getByTestId("MenuItemReviewForm-itemId")).toHaveValue(27);
    expect(screen.getByTestId("MenuItemReviewForm-reviewerEmail")).toHaveValue(
      "cgaucho@ucsb.edu",
    );
    expect(screen.getByTestId("MenuItemReviewForm-stars")).toHaveValue(5);
    expect(screen.getByTestId("MenuItemReviewForm-dateReviewed")).toHaveValue(
      "2022-01-02T12:00",
    );
    expect(screen.getByTestId("MenuItemReviewForm-comments")).toHaveValue(
      "Best pasta I have had in the dining commons",
    );
  });

  test("uses the buttonLabel prop", async () => {
    render(
      <Router>
        <MenuItemReviewForm buttonLabel="Update" />
      </Router>,
    );
    expect(await screen.findByText("Update")).toBeInTheDocument();
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-reviewerEmail");

    fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
      target: { value: "bad-input" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await screen.findByText(/Reviewer Email must be a valid email address./);
    expect(
      screen.getByText(/Item Id must be a positive whole number./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Stars must be between 0 and 5./),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
      target: { value: "-1" },
    });
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));
    await waitFor(() =>
      expect(screen.getByTestId("MenuItemReviewForm-stars")).toHaveValue(-1),
    );
    await screen.findByText(/Stars must be between 0 and 5./);
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-submit");

    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await screen.findByText(/Item Id is required./);
    expect(screen.getByText(/Reviewer Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Stars is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed is required./)).toBeInTheDocument();
    expect(screen.getByText(/Comments is required./)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <MenuItemReviewForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-itemId");

    fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), {
      target: { value: "27" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-dateReviewed"), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
      target: { value: "Best pasta" },
    });
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/is required./)).not.toBeInTheDocument();
    expect(screen.queryByText(/must be/)).not.toBeInTheDocument();
  });

  test("accepts 0 stars and 5 stars", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <MenuItemReviewForm
          initialContents={{
            ...menuItemReviewFixtures.oneMenuItemReview,
            stars: 0,
          }}
          submitAction={mockSubmitAction}
        />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-submit");
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));
    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/Stars must be/)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-cancel");

    fireEvent.click(screen.getByTestId("MenuItemReviewForm-cancel"));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
