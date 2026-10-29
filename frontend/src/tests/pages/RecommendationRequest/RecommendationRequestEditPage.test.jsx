import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
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
      id: 17,
    })),
    useNavigate: () => mockUseNavigate,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("RecommendationRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.adminUser);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/RecommendationRequest", { params: { id: 17 } })
        .timeout();
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
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit RecommendationRequest");
      expect(
        screen.queryByTestId("RecommendationRequestForm-requesterEmail"),
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
        .reply(200, apiCurrentUserFixtures.adminUser);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/RecommendationRequest", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          requesterEmail: "cgaucho@ucsb.edu",
          professorEmail: "phtcon@ucsb.edu",
          explanation: "BS/MS program",
          dateRequested: "2022-04-20T18:05:36",
          dateNeeded: "2022-05-01T09:30:15.123",
          done: false,
        });
      axiosMock.onPut("/api/RecommendationRequest").reply(200, {
        id: "17",
        requesterEmail: "ldelplaya@ucsb.edu",
        professorEmail: "richert@ucsb.edu",
        explanation: "PhD CS Stanford",
        dateRequested: "2022-05-20T00:00",
        dateNeeded: "2022-11-15T00:00",
        done: true,
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

    test("Is populated with the data provided, and changes are saved on Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const professorEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail",
      );
      const explanationField = screen.getByTestId(
        "RecommendationRequestForm-explanation",
      );
      const dateRequestedField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested",
      );
      const dateNeededField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded",
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId(
        "RecommendationRequestForm-submit",
      );

      expect(idField).toHaveValue("17");
      expect(requesterEmailField).toHaveValue("cgaucho@ucsb.edu");
      expect(professorEmailField).toHaveValue("phtcon@ucsb.edu");
      expect(explanationField).toHaveValue("BS/MS program");
      // seconds from the backend are dropped so the browser accepts the value
      expect(dateRequestedField).toHaveValue("2022-04-20T18:05");
      expect(dateNeededField).toHaveValue("2022-05-01T09:30");
      expect(doneField).not.toBeChecked();
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "richert@ucsb.edu" },
      });
      fireEvent.change(explanationField, {
        target: { value: "PhD CS Stanford" },
      });
      fireEvent.change(dateRequestedField, {
        target: { value: "2022-05-20T00:00" },
      });
      fireEvent.change(dateNeededField, {
        target: { value: "2022-11-15T00:00" },
      });
      fireEvent.click(doneField);
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest Updated - id: 17 requesterEmail: ldelplaya@ucsb.edu",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequest" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "ldelplaya@ucsb.edu",
          professorEmail: "richert@ucsb.edu",
          explanation: "PhD CS Stanford",
          dateRequested: "2022-05-20T00:00",
          dateNeeded: "2022-11-15T00:00",
          done: true,
        }),
      );
    });

    test("Invalid data shows errors and is not saved", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      fireEvent.change(
        screen.getByTestId("RecommendationRequestForm-professorEmail"),
        { target: { value: "not-an-email" } },
      );
      fireEvent.change(
        screen.getByTestId("RecommendationRequestForm-explanation"),
        { target: { value: "" } },
      );
      fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

      await screen.findByText("Professor Email must be a valid email address.");
      expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("Cancel goes back and does not save", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      fireEvent.change(
        screen.getByTestId("RecommendationRequestForm-explanation"),
        { target: { value: "Something else" } },
      );
      fireEvent.click(screen.getByTestId("RecommendationRequestForm-cancel"));

      await waitFor(() => expect(mockUseNavigate).toBeCalledWith(-1));
      expect(axiosMock.history.put.length).toBe(0);
    });
  });
});
