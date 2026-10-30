package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
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
public class ArticlesIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired ArticlesRepository articlesRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_article() throws Exception {
    // arrange
    assertEquals(0, articlesRepository.count());

    Articles expected =
        Articles.builder()
            .id(1L)
            .title("Mutation Testing with PIT")
            .url("https://pitest.org/")
            .explanation("Docs for the mutation testing tool we use in this course")
            .email("annagornyitzki@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2022-04-20T12:00:00"))
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/articles/post")
                    .param("title", "Mutation Testing with PIT")
                    .param("url", "https://pitest.org/")
                    .param(
                        "explanation", "Docs for the mutation testing tool we use in this course")
                    .param("email", "annagornyitzki@ucsb.edu")
                    .param("dateAdded", "2022-04-20T12:00:00")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert: the response contains the new article
    String expectedJson = mapper.writeValueAsString(expected);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);

    // assert: the article was actually saved in the database
    assertEquals(1, articlesRepository.count());
    Optional<Articles> saved = articlesRepository.findById(1L);
    assertTrue(saved.isPresent());
    assertEquals(expected, saved.get());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_delete_an_article() throws Exception {
    // arrange
    Articles article =
        Articles.builder()
            .title("Handy Spring Utility Classes")
            .url("https://spring.io/")
            .explanation("A lot of really useful classes are built into Spring")
            .email("phtcon@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2022-04-19T12:00:00"))
            .build();
    Articles saved = articlesRepository.save(article);
    long id = saved.getId();
    assertTrue(articlesRepository.findById(id).isPresent());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/articles").param("id", String.valueOf(id)).with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert: the response message is correct
    Map<String, Object> json =
        mapper.readValue(response.getResponse().getContentAsString(), Map.class);
    assertEquals("Articles with id %d deleted".formatted(id), json.get("message"));

    // assert: the article is gone from the database
    assertFalse(articlesRepository.findById(id).isPresent());
    assertEquals(0, articlesRepository.count());
  }
}
