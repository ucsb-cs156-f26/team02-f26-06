import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";
import { beforeEach, afterEach } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
const mockedUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    useNavigate: () => mockedUseNavigate,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
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
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit Article");
      expect(
        screen.queryByTestId("ArticlesForm-title"),
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Mutation Testing with PIT",
        url: "https://pitest.org/",
        explanation: "Docs for the mutation testing tool",
        email: "cgaucho@ucsb.edu",
        dateAdded: "2022-04-20T12:00",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "Handy Spring Utility Classes",
        url: "https://spring.io/",
        explanation: "Useful classes built into Spring",
        email: "ldelplaya@ucsb.edu",
        dateAdded: "2022-12-25T08:00",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      mockedUseNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText(/Welcome/);
      await screen.findByTestId("ArticlesForm-title");
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      expect(screen.getByTestId("ArticlesForm-id")).toHaveValue("17");
      expect(screen.getByTestId("ArticlesForm-title")).toHaveValue(
        "Mutation Testing with PIT",
      );
      expect(screen.getByTestId("ArticlesForm-url")).toHaveValue(
        "https://pitest.org/",
      );
      expect(screen.getByTestId("ArticlesForm-explanation")).toHaveValue(
        "Docs for the mutation testing tool",
      );
      expect(screen.getByTestId("ArticlesForm-email")).toHaveValue(
        "cgaucho@ucsb.edu",
      );
      expect(screen.getByTestId("ArticlesForm-dateAdded")).toHaveValue(
        "2022-04-20T12:00",
      );
      expect(screen.getByTestId("ArticlesForm-submit")).toHaveTextContent(
        "Update",
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "Handy Spring Utility Classes" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-url"), {
        target: { value: "https://spring.io/" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), {
        target: { value: "Useful classes built into Spring" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-email"), {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-dateAdded"), {
        target: { value: "2022-12-25T08:00" },
      });

      fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Handy Spring Utility Classes",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "Handy Spring Utility Classes",
          url: "https://spring.io/",
          explanation: "Useful classes built into Spring",
          email: "ldelplaya@ucsb.edu",
          dateAdded: "2022-12-25T08:00",
        }),
      );
    });

    test("Invalid data is not saved and shows an error", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

      await screen.findByText(/Title is required./);
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("Cancel goes back without saving", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "Something else" },
      });
      fireEvent.click(screen.getByTestId("ArticlesForm-cancel"));

      await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith(-1));
      expect(axiosMock.history.put.length).toBe(0);
    });

    test("in storybook mode, it does not navigate after Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage storybook={true} />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");
      fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText("Edit Article")).toBeInTheDocument();
    });
  });
});
