import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
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

describe("UCSBOrganizationCreatePage tests", () => {
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

  const queryClient = new QueryClient();

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Org Code")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /ucsborganization", async () => {
    const queryClient = new QueryClient();
    const organization = {
      orgCode: "SKY",
      orgTranslationShort: "SKYDIVING CLUB",
      orgTranslation: "SKYDIVING CLUB AT UCSB",
      inactive: true,
    };

    axiosMock.onPost("/api/ucsborganization/post").reply(202, organization);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Org Code")).toBeInTheDocument();
    });

    const orgCodeInput = screen.getByLabelText("Org Code");
    const orgTranslationShortInput = screen.getByLabelText(
      "Org Translation Short",
    );
    const orgTranslationInput = screen.getByLabelText("Org Translation");
    const inactiveCheckbox = screen.getByLabelText("Inactive");
    const createButton = screen.getByText("Create");

    expect(orgTranslationShortInput).toBeInTheDocument();
    expect(orgTranslationInput).toBeInTheDocument();
    expect(inactiveCheckbox).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();

    fireEvent.change(orgCodeInput, { target: { value: "SKY" } });
    fireEvent.change(orgTranslationShortInput, {
      target: { value: "SKYDIVING CLUB" },
    });
    fireEvent.change(orgTranslationInput, {
      target: { value: "SKYDIVING CLUB AT UCSB" },
    });
    fireEvent.click(inactiveCheckbox);
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "SKY",
      orgTranslationShort: "SKYDIVING CLUB",
      orgTranslation: "SKYDIVING CLUB AT UCSB",
      inactive: true,
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New organization Created - orgCode: SKY orgTranslationShort: SKYDIVING CLUB",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
  });

  test("on invalid data, shows errors, sends no request, and does not redirect", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Org Code")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create"));

    await screen.findByText(/Org Code is required/);
    expect(
      screen.getByText(/Org Translation Short is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Org Translation is required/)).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toBeCalled();
    expect(mockToast).not.toBeCalled();
  });
});
