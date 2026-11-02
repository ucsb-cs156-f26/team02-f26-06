package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Page;
import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_ucsborganization() throws Exception {
    setupUser(true);

    page.getByText("UCSBOrganization", new Page.GetByTextOptions().setExact(true)).click();

    page.getByText("Create UCSBOrganization").click();
    assertThat(page.getByText("Create New UCSBOrganization")).isVisible();
    page.getByTestId("UCSBOrganizationForm-orgCode").fill("SKY");
    page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("SKYDIVING CLUB");
    page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("SKYDIVING CLUB AT UCSB");
    page.getByTestId("UCSBOrganizationForm-inactive").check();
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).hasText("SKY");
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("SKYDIVING CLUB AT UCSB");
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-inactive")).hasText("true");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit UCSBOrganization")).isVisible();
    page.getByTestId("UCSBOrganizationForm-orgTranslation")
        .fill("SKYDIVING CLUB AT UC SANTA BARBARA");
    page.getByTestId("UCSBOrganizationForm-inactive").uncheck();
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("SKYDIVING CLUB AT UC SANTA BARBARA");
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-inactive")).hasText("false");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_ucsborganization() throws Exception {
    setupUser(false);

    page.getByText("UCSBOrganization", new Page.GetByTextOptions().setExact(true)).click();

    assertThat(page.getByText("Create UCSBOrganization")).not().isVisible();
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
  }
}
