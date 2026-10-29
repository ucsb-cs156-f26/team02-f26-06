import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
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

describe("UCSBOrganizationForm tests", () => {
  const testId = "UCSBOrganizationForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expect(screen.getByText("Org Code")).toBeInTheDocument();
    expect(screen.getByText("Org Translation Short")).toBeInTheDocument();
    expect(screen.getByText("Org Translation")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();

    // On create, orgCode is editable and the fields start empty
    expect(screen.getByTestId(`${testId}-orgCode`)).not.toHaveAttribute(
      "readonly",
    );
    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveValue("");
    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue("");
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue("");
    expect(screen.getByTestId(`${testId}-inactive`)).not.toBeChecked();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <UCSBOrganizationForm
          initialContents={ucsbOrganizationFixtures.oneOrganization}
        />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    // On edit, orgCode is shown but read-only
    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveValue("ITS");
    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveAttribute("readonly");
    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue(
      "INFORMATION TECHNOLOGY SERVICES",
    );
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue(
      "INFORMATION TECHNOLOGY SERVICES",
    );
    expect(screen.getByTestId(`${testId}-inactive`)).not.toBeChecked();
  });

  test("inactive is checked when initialContents is inactive", async () => {
    render(
      <Router>
        <UCSBOrganizationForm
          initialContents={ucsbOrganizationFixtures.threeOrganizations[2]}
        />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-inactive`)).toBeChecked();
  });

  test("uses the buttonLabel prop", async () => {
    render(
      <Router>
        <UCSBOrganizationForm buttonLabel="Update" />
      </Router>,
    );

    expect(await screen.findByText(/Update/)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("Correct Error messages on missing input", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-submit`)).toBeInTheDocument();
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.click(submitButton);

    await screen.findByText(/Org Code is required./);
    expect(
      screen.getByText(/Org Translation Short is required./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Org Translation is required./),
    ).toBeInTheDocument();
  });

  test("Correct Error messages when input is too long", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();

    const tooLong = "a".repeat(256);
    fireEvent.change(screen.getByTestId(`${testId}-orgCode`), {
      target: { value: tooLong },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: tooLong },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: tooLong },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(screen.getAllByText(/Max length 255 characters/)).toHaveLength(3);
    });
  });

  test("No Error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <UCSBOrganizationForm submitAction={mockSubmitAction} />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId(`${testId}-orgCode`), {
      target: { value: "SKY" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "SKYDIVING CLUB" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "SKYDIVING CLUB AT UCSB" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-inactive`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(mockSubmitAction.mock.calls[0][0]).toEqual({
      orgCode: "SKY",
      orgTranslationShort: "SKYDIVING CLUB",
      orgTranslation: "SKYDIVING CLUB AT UCSB",
      inactive: true,
    });

    expect(screen.queryByText(/is required./)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Max length 255 characters/),
    ).not.toBeInTheDocument();
  });
});
