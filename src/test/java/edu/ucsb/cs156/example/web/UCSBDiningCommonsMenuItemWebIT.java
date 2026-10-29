package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

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
public class UCSBDiningCommonsMenuItemWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_ucsbdiningcommonsmenuitem() throws Exception {
    setupUser(true);

    page.getByText("UCSBDiningCommonsMenuItem").click();

    page.getByText("Create UCSBDiningCommonsMenuItem").click();
    assertThat(page.getByText("Create New UCSBDiningCommonsMenuItem")).isVisible();
    page.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode").fill("ortega");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-name").fill("Baked Pesto Pasta");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-station").fill("Entree Specials");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-submit").click();

    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-name"))
        .hasText("Baked Pesto Pasta");

    page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit UCSBDiningCommonsMenuItem")).isVisible();
    page.getByTestId("UCSBDiningCommonsMenuItemForm-name").fill("Tofu Banh Mi Sandwich");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-submit").click();

    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-name"))
        .hasText("Tofu Banh Mi Sandwich");

    page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-name"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_ucsbdiningcommonsmenuitem() throws Exception {
    setupUser(false);

    page.getByText("UCSBDiningCommonsMenuItem").click();

    assertThat(page.getByText("Create UCSBDiningCommonsMenuItem")).not().isVisible();
    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-name"))
        .not()
        .isVisible();
  }
}
