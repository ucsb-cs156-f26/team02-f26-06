import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

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
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      orgCode: "SKY",
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("UCSBOrganizationEditPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "UCSBOrganizationForm";

  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  describe("tests where backend is unavailable", () => {
    beforeEach(() => {
      axiosMock
        .onGet("/api/ucsborganization", { params: { orgCode: "SKY" } })
        .timeout();
    });

    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText("Edit UCSBOrganization");
      expect(screen.queryByTestId(`${testId}-orgCode`)).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock
        .onGet("/api/ucsborganization", { params: { orgCode: "SKY" } })
        .reply(200, {
          orgCode: "SKY",
          orgTranslationShort: "SKYDIVING CLUB",
          orgTranslation: "SKYDIVING CLUB AT UCSB",
          inactive: false,
        });
      axiosMock.onPut("/api/ucsborganization").reply(200, {
        orgCode: "SKY",
        orgTranslationShort: "SKY CLUB",
        orgTranslation: "SKYDIVING CLUB AT UC SANTA BARBARA",
        inactive: true,
      });
    });

    test("renders the form populated with the existing data", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId(`${testId}-orgCode`);

      const orgCodeField = screen.getByTestId(`${testId}-orgCode`);
      const orgTranslationShortField = screen.getByTestId(
        `${testId}-orgTranslationShort`,
      );
      const orgTranslationField = screen.getByTestId(
        `${testId}-orgTranslation`,
      );
      const inactiveField = screen.getByTestId(`${testId}-inactive`);
      const submitButton = screen.getByTestId(`${testId}-submit`);

      expect(orgCodeField).toHaveValue("SKY");
      expect(orgCodeField).toHaveAttribute("readonly");
      expect(orgTranslationShortField).toHaveValue("SKYDIVING CLUB");
      expect(orgTranslationField).toHaveValue("SKYDIVING CLUB AT UCSB");
      expect(inactiveField).not.toBeChecked();
      expect(submitButton).toHaveTextContent("Update");
    });

    test("changes are saved and the user is redirected to /ucsborganization", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId(`${testId}-orgCode`);

      const orgTranslationShortField = screen.getByTestId(
        `${testId}-orgTranslationShort`,
      );
      const orgTranslationField = screen.getByTestId(
        `${testId}-orgTranslation`,
      );
      const inactiveField = screen.getByTestId(`${testId}-inactive`);
      const submitButton = screen.getByTestId(`${testId}-submit`);

      fireEvent.change(orgTranslationShortField, {
        target: { value: "SKY CLUB" },
      });
      fireEvent.change(orgTranslationField, {
        target: { value: "SKYDIVING CLUB AT UC SANTA BARBARA" },
      });
      fireEvent.click(inactiveField);
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "UCSBOrganization Updated - orgCode: SKY orgTranslationShort: SKY CLUB",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ orgCode: "SKY" });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        orgTranslationShort: "SKY CLUB",
        orgTranslation: "SKYDIVING CLUB AT UC SANTA BARBARA",
        inactive: true,
      });
    });

    test("invalid data shows errors and nothing is saved", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId(`${testId}-orgCode`);

      fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByTestId(`${testId}-submit`));

      await screen.findByText(/Org Translation is required/);

      expect(axiosMock.history.put.length).toBe(0);
      expect(mockToast).not.toBeCalled();
      expect(mockNavigate).not.toBeCalled();
    });

    test("clicking Cancel does not save changes", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId(`${testId}-orgCode`);

      fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
        target: { value: "SOMETHING ELSE" },
      });
      fireEvent.click(screen.getByTestId(`${testId}-cancel`));

      expect(axiosMock.history.put.length).toBe(0);
      expect(mockToast).not.toBeCalled();
    });
  });
});
