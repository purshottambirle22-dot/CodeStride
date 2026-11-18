package com.codestride.catalog;

import com.codestride.catalog.dto.PatternResponse;
import com.codestride.catalog.dto.TopicResponse;
import com.codestride.catalog.service.PatternService;
import com.codestride.catalog.service.TopicService;
import com.codestride.config.TestMongoConfig;
import com.codestride.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestMongoConfig.class)
class CatalogSecurityAndControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private TopicService topicService;

    @MockitoBean
    private PatternService patternService;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    void testAdminCreateTopic_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(post("/api/v1/admin/topics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Arrays\",\"slug\":\"arrays\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testAdminCreateTopic_WithUserRole_Returns403() throws Exception {
        String userToken = jwtService.generateToken("user@example.com", "USER");

        mockMvc.perform(post("/api/v1/admin/topics")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Arrays\",\"slug\":\"arrays\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminCreateTopic_WithAdminRole_Returns200() throws Exception {
        String adminToken = jwtService.generateToken("admin@example.com", "ADMIN");

        TopicResponse mockResponse = new TopicResponse(
                "t1", "Arrays", "arrays", "Sequential memory",
                "Detailed overview", 1, "grid-3x3", true,
                Instant.now(), Instant.now(), 5, 20, 0, 0
        );

        when(topicService.createTopic(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/admin/topics")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Arrays\",\"slug\":\"arrays\",\"description\":\"Sequential memory\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("t1"))
                .andExpect(jsonPath("$.name").value("Arrays"))
                .andExpect(jsonPath("$.slug").value("arrays"));
    }

    @Test
    void testAdminCreatePattern_WithAdminRole_Returns200() throws Exception {
        String adminToken = jwtService.generateToken("admin@example.com", "ADMIN");

        PatternResponse mockResponse = new PatternResponse(
                "p1", "t1", "Two Pointers", "two-pointers-pattern",
                "Two pointers technique", "Detailed explanation",
                "Sorted arrays", "Pair sum", "Left and right pointers",
                "O(N)", "O(1)", List.of(), 1, true,
                Instant.now(), Instant.now(), "Arrays", "arrays",
                10, 5, 50, 4, 4, 2
        );

        when(patternService.createPattern(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/admin/patterns")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"topicId\":\"t1\",\"name\":\"Two Pointers\",\"slug\":\"two-pointers-pattern\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("p1"))
                .andExpect(jsonPath("$.name").value("Two Pointers"));
    }

    @Test
    void testGetTopicsBySlug_UserAccess_Returns200() throws Exception {
        String userToken = jwtService.generateToken("student@example.com", "USER");

        User student = new User();
        student.setId("usr-123");
        student.setEmail("student@example.com");
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));

        TopicResponse mockResponse = new TopicResponse(
                "t1", "Sliding Window", "sliding-window", "Moving subsegment",
                "Detailed guide", 7, "sliders", true,
                Instant.now(), Instant.now(), 4, 15, 3, 20
        );

        when(topicService.getTopicBySlug(eq("sliding-window"), eq("usr-123"))).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/topics/slug/sliding-window")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Sliding Window"))
                .andExpect(jsonPath("$.slug").value("sliding-window"))
                .andExpect(jsonPath("$.completionPercentage").value(20));
    }
}
