import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
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

describe("HelpRequestCreatePage tests", () => {
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
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /helprequest", async () => {
    const queryClient = new QueryClient();
    const helpRequest = {
      id: 3,
      requesterEmail: "student3@ucsb.edu",
      teamId: "s22-5pm-3",
      tableOrBreakoutRoom: "7",
      requestTime: "2022-01-02T12:00",
      explanation: "Need help with Swagger-ui",
      solved: false,
    };

    axiosMock.onPost("/api/helprequest/post").reply(202, helpRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "student3@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Team ID"), {
      target: { value: "s22-5pm-3" },
    });
    fireEvent.change(screen.getByLabelText("Table Or Breakout Room"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByLabelText("Request Time (iso format)"), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Need help with Swagger-ui" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "student3@ucsb.edu",
      teamId: "s22-5pm-3",
      tableOrBreakoutRoom: "7",
      requestTime: "2022-01-02T12:00",
      explanation: "Need help with Swagger-ui",
      solved: false,
    });

    expect(mockToast).toBeCalledWith("New helpRequest Created - id: 3");
    expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });
  });
});
