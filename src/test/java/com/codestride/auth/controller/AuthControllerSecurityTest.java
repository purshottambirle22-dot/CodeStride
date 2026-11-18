package com.codestride.auth.controller;

import com.codestride.auth.dto.LoginRequest;
import com.codestride.auth.dto.LoginResponse;
import com.codestride.auth.dto.RegisterRequest;
import com.codestride.auth.service.AuthService;
import com.codestride.security.JwtService;
import com.codestride.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.codestride.config.TestMongoConfig;
import org.springframework.context.annotation.Import;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestMongoConfig.class)
class AuthControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private AuthService authService;

    @Test
    void testLogin_Success_Returns200AndToken() throws Exception {
        LoginRequest request = new LoginRequest("user@example.com", "password123");
        when(authService.login(eq("user@example.com"), eq("password123")))
                .thenReturn(new LoginResponse("mocked.jwt.token", "mocked.refresh.token", "Bearer"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", is("mocked.jwt.token")))
                .andExpect(jsonPath("$.tokenType", is("Bearer")));
    }

    @Test
    void testLogin_InvalidPassword_Returns401Unauthorized() throws Exception {
        LoginRequest request = new LoginRequest("user@example.com", "wrongPassword");
        when(authService.login(eq("user@example.com"), eq("wrongPassword")))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    void testLogin_UnknownEmail_Returns401Unauthorized() throws Exception {
        LoginRequest request = new LoginRequest("unknown@example.com", "password123");
        when(authService.login(eq("unknown@example.com"), eq("password123")))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    void testLogin_DatabaseTimeout_Returns503ServiceUnavailable_Not401() throws Exception {
        LoginRequest request = new LoginRequest("user@example.com", "password123");
        when(authService.login(any(), any()))
                .thenThrow(new DataAccessResourceFailureException("Timeout while receiving message"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is(503)))
                .andExpect(jsonPath("$.error", is("Service Unavailable")))
                .andExpect(jsonPath("$.message", containsString("Database service is temporarily unavailable")));
    }

    @Test
    void testLogin_WithStaleBearerTokenHeader_NotBlockedByJwtFilter() throws Exception {
        LoginRequest request = new LoginRequest("user@example.com", "password123");
        when(authService.login(eq("user@example.com"), eq("password123")))
                .thenReturn(new LoginResponse("new.valid.jwt.token", "mocked.refresh.token", "Bearer"));

        // Stale or expired token in the Authorization header should NOT block the public login endpoint
        mockMvc.perform(post("/api/v1/auth/login")
                        .header("Authorization", "Bearer invalid.expired.leftover.token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", is("new.valid.jwt.token")));
    }

    @Test
    void testRegister_Success_Returns201() throws Exception {
        RegisterRequest request = new RegisterRequest("newuser", "newuser@example.com", "password123");
        User user = new User();
        user.setId("user-123");
        user.setUsername("newuser");
        user.setEmail("newuser@example.com");

        when(authService.register(any(), any(), any())).thenReturn(user);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", is("Registration successful")))
                .andExpect(jsonPath("$.userId", is("user-123")));
    }

    @Test
    void testRegister_DuplicateEmail_Returns400BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest("existing", "existing@example.com", "password123");
        when(authService.register(any(), any(), any()))
                .thenThrow(new IllegalArgumentException("Email already registered"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", is("Email already registered")));
    }

    @Test
    void testProtectedEndpoint_WithoutToken_Returns401Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    void testProtectedEndpoint_WithValidToken_Returns200Ok() throws Exception {
        String token = jwtService.generateToken("testuser@example.com", "USER");

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("testuser@example.com")))
                .andExpect(jsonPath("$.message", is("JWT authentication successful")));
    }

    @Test
    void testAdminEndpoint_WithUserRole_Returns403Forbidden() throws Exception {
        String userToken = jwtService.generateToken("regular@example.com", "USER");

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminEndpoint_WithAdminRole_Returns200Ok() throws Exception {
        String adminToken = jwtService.generateToken("admin@example.com", "ADMIN");

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Welcome to Admin Dashboard")));
    }
}
