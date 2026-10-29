import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("MenuItemReviewCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders without crashing", async () => {
    renderPage();

    await screen.findByText("Create New MenuItemReview");
    expect(screen.getByLabelText("Item Id")).toBeInTheDocument();
    expect(screen.getByLabelText("Reviewer Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Stars")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Date Reviewed (iso format)"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Comments")).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /menuitemreview", async () => {
    const review = {
      id: 7,
      itemId: 27,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 5,
      dateReviewed: "2022-01-02T12:00",
      comments: "Great",
    };

    axiosMock.onPost("/api/MenuItemReview/post").reply(202, review);

    renderPage();

    await screen.findByText("Create New MenuItemReview");

    fireEvent.change(screen.getByLabelText("Item Id"), {
      target: { value: "27" },
    });
    fireEvent.change(screen.getByLabelText("Reviewer Email"), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Stars"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Date Reviewed (iso format)"), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(screen.getByLabelText("Comments"), {
      target: { value: "Great" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: "27",
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: "5",
      dateReviewed: "2022-01-02T12:00",
      comments: "Great",
    });

    expect(mockToast).toBeCalledWith("New MenuItemReview Created - id: 7");
    expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
  });

  test("does not submit invalid data, shows errors, and stays on the page", async () => {
    renderPage();

    await screen.findByText("Create New MenuItemReview");

    fireEvent.change(screen.getByLabelText("Reviewer Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText("Stars"), {
      target: { value: "9" },
    });
    fireEvent.click(screen.getByText("Create"));

    await screen.findByText("Item Id is required.");
    expect(
      screen.getByText("Reviewer Email must be a valid email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Stars must be between 0 and 5."),
    ).toBeInTheDocument();
    expect(screen.getByText("Date Reviewed is required.")).toBeInTheDocument();
    expect(screen.getByText("Comments is required.")).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockToast).not.toBeCalled();
    expect(mockNavigate).not.toBeCalled();
  });
});
