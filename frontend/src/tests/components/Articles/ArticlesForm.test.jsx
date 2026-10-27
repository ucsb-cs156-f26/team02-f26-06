import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesForm tests", () => {
  const expectedHeaders = [
    "Title",
    "URL",
    "Explanation",
    "Email",
    "Date Added (iso format)",
  ];
  const testId = "ArticlesForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <ArticlesForm
          initialContents={articlesFixtures.oneArticle}
          buttonLabel="Update"
        />
      </Router>,
    );

    expect(await screen.findByText(/Update/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-title`)).toHaveValue(
      articlesFixtures.oneArticle.title,
    );
    expect(screen.getByTestId(`${testId}-url`)).toHaveValue(
      articlesFixtures.oneArticle.url,
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      articlesFixtures.oneArticle.explanation,
    );
    expect(screen.getByTestId(`${testId}-email`)).toHaveValue(
      articlesFixtures.oneArticle.email,
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    const cancelButton = await screen.findByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("shows required messages when all fields are empty", async () => {
    const mockSubmitAction = vi.fn();
    render(
      <Router>
        <ArticlesForm submitAction={mockSubmitAction} />
      </Router>,
    );

    fireEvent.click(await screen.findByTestId(`${testId}-submit`));

    await screen.findByText(/Title is required./);
    expect(screen.getByText(/URL is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Added is required./)).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("shows error messages on bad input", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );

    fireEvent.change(await screen.findByTestId(`${testId}-title`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "not-a-url" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await screen.findByText(/Title must be at most 255 characters./);
    expect(
      screen.getByText(/Explanation must be at most 255 characters./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/URL must start with http:\/\/ or https:\/\//),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Email must be a valid email address./),
    ).toBeInTheDocument();
  });

  test("submits with no errors on good input", async () => {
    const mockSubmitAction = vi.fn();
    render(
      <Router>
        <ArticlesForm submitAction={mockSubmitAction} />
      </Router>,
    );

    fireEvent.change(await screen.findByTestId(`${testId}-title`), {
      target: { value: "a".repeat(255) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "b".repeat(255) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "https://pitest.org/" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateAdded`), {
      target: { value: "2022-04-20T12:00" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/at most 255/)).not.toBeInTheDocument();
    expect(screen.queryByText(/must start with/)).not.toBeInTheDocument();
    expect(screen.queryByText(/valid email/)).not.toBeInTheDocument();
  });
});