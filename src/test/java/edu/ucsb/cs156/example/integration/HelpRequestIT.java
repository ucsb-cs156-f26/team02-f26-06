package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired HelpRequestRepository helpRequestRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    // arrange
    HelpRequest helpRequest =
        HelpRequest.builder()
            .requesterEmail("a@ucsb.edu")
            .teamId("team01")
            .tableOrBreakoutRoom("table 1")
            .requestTime(LocalDateTime.parse("2026-10-20T12:00:00"))
            .explanation("Stuck on tests")
            .solved(false)
            .build();

    helpRequest = helpRequestRepository.save(helpRequest);

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/helprequest").param("id", String.valueOf(helpRequest.getId())))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(helpRequest);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_delete_a_helprequest() throws Exception {
    // arrange
    HelpRequest helpRequest =
        HelpRequest.builder()
            .requesterEmail("a@ucsb.edu")
            .teamId("team01")
            .tableOrBreakoutRoom("table 1")
            .requestTime(LocalDateTime.parse("2026-10-20T12:00:00"))
            .explanation("Stuck on tests")
            .solved(false)
            .build();

    helpRequest = helpRequestRepository.save(helpRequest);
    long id = helpRequest.getId();

    // act
    mockMvc
        .perform(delete("/api/helprequest").param("id", String.valueOf(id)).with(csrf()))
        .andExpect(status().isOk());

    // assert
    assertTrue(helpRequestRepository.findById(id).isEmpty());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_helprequest() throws Exception {
    // arrange
    HelpRequest expected =
        HelpRequest.builder()
            .id(1L)
            .requesterEmail("a@ucsb.edu")
            .teamId("team01")
            .tableOrBreakoutRoom("table 1")
            .requestTime(LocalDateTime.parse("2026-10-20T12:00:00"))
            .explanation("Stuck on tests")
            .solved(true)
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/helprequest/post")
                    .param("requesterEmail", "a@ucsb.edu")
                    .param("teamId", "team01")
                    .param("tableOrBreakoutRoom", "table 1")
                    .param("requestTime", "2026-10-20T12:00:00")
                    .param("explanation", "Stuck on tests")
                    .param("solved", "true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(expected);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
}
