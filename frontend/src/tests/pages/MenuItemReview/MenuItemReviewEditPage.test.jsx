import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
const mockUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 1,
    })),
    useNavigate: () => mockUseNavigate,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("MenuItemReviewEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/MenuItemReview", { params: { id: 1 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit MenuItemReview");
      expect(
        screen.queryByTestId("MenuItemReviewForm-itemId"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/MenuItemReview", { params: { id: 1 } })
        .reply(200, menuItemReviewFixtures.oneMenuItemReview);
      axiosMock.onPut("/api/MenuItemReview").reply(200, {
        id: 1,
        itemId: 99,
        reviewerEmail: "ldelplaya@ucsb.edu",
        stars: 4,
        dateReviewed: "2022-02-03T10:30",
        comments: "Updated comment",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      mockUseNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      expect(screen.getByTestId("MenuItemReviewForm-id")).toHaveValue("1");
      expect(screen.getByTestId("MenuItemReviewForm-itemId")).toHaveValue(27);
      expect(
        screen.getByTestId("MenuItemReviewForm-reviewerEmail"),
      ).toHaveValue("cgaucho@ucsb.edu");
      expect(screen.getByTestId("MenuItemReviewForm-stars")).toHaveValue(5);
      expect(screen.getByTestId("MenuItemReviewForm-dateReviewed")).toHaveValue(
        "2022-01-02T12:00",
      );
      expect(screen.getByTestId("MenuItemReviewForm-comments")).toHaveValue(
        "Best pasta I have had in the dining commons",
      );
      expect(screen.getByTestId("MenuItemReviewForm-submit")).toHaveTextContent(
        "Update",
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), {
        target: { value: "99" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
        target: { value: "4" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-dateReviewed"), {
        target: { value: "2022-02-03T10:30" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
        target: { value: "Updated comment" },
      });
      fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith("MenuItemReview Updated - id: 1");
      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: "99",
          reviewerEmail: "ldelplaya@ucsb.edu",
          stars: "4",
          dateReviewed: "2022-02-03T10:30",
          comments: "Updated comment",
        }),
      );
    });

    test("Does not save when the data is invalid", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
        target: { value: "not-an-email" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
        target: { value: "9" },
      });
      fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

      await screen.findByText("Reviewer Email must be a valid email address.");
      expect(screen.getByText("Stars must be between 0 and 5.")).toBeVisible();

      expect(axiosMock.history.put.length).toBe(0);
      expect(mockToast).not.toBeCalled();
      expect(mockNavigate).not.toBeCalled();
    });

    test("Does not save when you click Cancel", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
        target: { value: "Something I will not save" },
      });
      fireEvent.click(screen.getByTestId("MenuItemReviewForm-cancel"));

      await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith(-1));
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockToast).not.toBeCalled();
    });
  });
});
