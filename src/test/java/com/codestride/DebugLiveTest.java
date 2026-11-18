package com.codestride;

import com.codestride.catalog.repository.PatternRepository;
import com.codestride.catalog.repository.TopicRepository;
import com.codestride.security.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.mongodb.uri=${MONGODB_URI}",
        "spring.mongodb.database=codestride",
        "spring.data.mongodb.uri=${MONGODB_URI}",
        "spring.data.mongodb.database=codestride"
})
class DebugLiveTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private PatternRepository patternRepository;

    @Test
    @DisplayName("GET /api/v1/users/me without token returns 401 Unauthorized")
    void testGetMeWithoutToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("GET /api/v1/users/me with valid Bearer token returns 200 OK")
    void testGetMeWithToken_Returns200() throws Exception {
        String token = jwtService.generateToken("testuser@example.com", "USER");

        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("testuser@example.com"));
    }

    @Test
    @DisplayName("GET /api/v1/topics/6ae0d1b338dd9c4c8621b58f/patterns returns 200 OK with patterns")
    void testGetTopicPatterns_Arrays_Returns200() throws Exception {
        String token = jwtService.generateToken("testuser@example.com", "USER");
        String topicId = "6ae0d1b338dd9c4c8621b58f";

        mockMvc.perform(get("/api/v1/topics/" + topicId + "/patterns")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)))
                .andExpect(jsonPath("$.length()", greaterThan(0)));
    }

    @Test
    @DisplayName("GET /api/v1/topics/6ae4bbbb295e81b59f837d11/patterns returns 200 OK with patterns")
    void testGetTopicPatterns_SecondTopic_Returns200() throws Exception {
        String token = jwtService.generateToken("testuser@example.com", "USER");
        String topicId = "6ae4bbbb295e81b59f837d11";

        mockMvc.perform(get("/api/v1/topics/" + topicId + "/patterns")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("GET /api/v1/patterns/6ae0d4c638dd9c4c8621b5a5/questions returns 200 OK with questions")
    void testGetPatternQuestions_TwoPointers_Returns200() throws Exception {
        String token = jwtService.generateToken("testuser@example.com", "USER");
        String patternId = "6ae0d4c638dd9c4c8621b5a5";

        mockMvc.perform(get("/api/v1/patterns/" + patternId + "/questions")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)))
                .andExpect(jsonPath("$.length()", greaterThan(0)));
    }

    @Test
    @DisplayName("GET /api/v1/patterns/6ae4bbbd295e81b59f837d1f/questions returns 200 OK with questions")
    void testGetPatternQuestions_SecondPattern_Returns200() throws Exception {
        String token = jwtService.generateToken("testuser@example.com", "USER");
        String patternId = "6ae4bbbd295e81b59f837d1f";

        mockMvc.perform(get("/api/v1/patterns/" + patternId + "/questions")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("GET /api/v1/topics/6ae000000000000000000000/patterns returns 404 for nonexistent topic ID")
    void testGetTopicPatterns_NonExistentTopic_Returns404() throws Exception {
        String token = jwtService.generateToken("testuser@example.com", "USER");
        String nonExistentId = "6ae000000000000000000000";

        mockMvc.perform(get("/api/v1/topics/" + nonExistentId + "/patterns")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("GET /api/v1/patterns/6ae000000000000000000000/questions returns 404 for nonexistent pattern ID")
    void testGetPatternQuestions_NonExistentPattern_Returns404() throws Exception {
        String token = jwtService.generateToken("testuser@example.com", "USER");
        String nonExistentId = "6ae000000000000000000000";

        mockMvc.perform(get("/api/v1/patterns/" + nonExistentId + "/questions")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("GET /api/v1/topics/invalid!@#/patterns returns 400 Bad Request for malformed ID")
    void testGetTopicPatterns_InvalidId_Returns400() throws Exception {
        String token = jwtService.generateToken("testuser@example.com", "USER");

        mockMvc.perform(get("/api/v1/topics/invalid!@#/patterns")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("GET /api/v1/patterns/invalid!@#/questions returns 400 Bad Request for malformed ID")
    void testGetPatternQuestions_InvalidId_Returns400() throws Exception {
        String token = jwtService.generateToken("testuser@example.com", "USER");

        mockMvc.perform(get("/api/v1/patterns/invalid!@#/questions")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
