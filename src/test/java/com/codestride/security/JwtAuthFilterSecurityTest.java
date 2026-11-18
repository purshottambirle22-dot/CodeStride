package com.codestride.security;

import com.codestride.config.TestMongoConfig;
import com.codestride.dashboard.dto.DashboardResponse;
import com.codestride.dashboard.service.DashboardService;
import com.codestride.leaderboard.dto.LeaderboardPageResponse;
import com.codestride.leaderboard.dto.LeaderboardResponse;
import com.codestride.leaderboard.service.LeaderboardService;
import com.codestride.scoring.dto.PointsSummaryResponse;
import com.codestride.user.dto.UserResponse;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestMongoConfig.class)
class JwtAuthFilterSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @MockitoBean
    private DashboardService dashboardService;

    @MockitoBean
    private LeaderboardService leaderboardService;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    @DisplayName("1. Valid access token authenticates the request")
    void testValidAccessToken_AuthenticatesRequest() throws Exception {
        String token = jwtService.generateToken("user@example.com", "USER");

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("user@example.com")))
                .andExpect(jsonPath("$.message", is("JWT authentication successful")));
    }

    @Test
    @DisplayName("2. Missing token is rejected on protected endpoints")
    void testMissingToken_RejectedOnProtectedEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));

        mockMvc.perform(get("/api/v1/leaderboard"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    @DisplayName("3. Expired token is rejected")
    void testExpiredToken_IsRejected() throws Exception {
        Date past = new Date(System.currentTimeMillis() - 60000);
        String expiredToken = Jwts.builder()
                .subject("expired@example.com")
                .claim("role", "USER")
                .issuedAt(new Date(past.getTime() - 60000))
                .expiration(past)
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        mockMvc.perform(get("/api/v1/dashboard/me")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")))
                .andExpect(jsonPath("$.message", is("Token has expired")));
    }

    @Test
    @DisplayName("4. Invalid signature is rejected")
    void testInvalidSignature_IsRejected() throws Exception {
        String otherSecret = "differentSecretKeyForSigningThatMustBeAtLeast256BitsLong!";
        String tamperedToken = Jwts.builder()
                .subject("tampered@example.com")
                .claim("role", "USER")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(Keys.hmacShaKeyFor(otherSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        mockMvc.perform(get("/api/v1/dashboard/me")
                        .header("Authorization", "Bearer " + tamperedToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")))
                .andExpect(jsonPath("$.message", is("Invalid JWT signature")));
    }

    @Test
    @DisplayName("5. Malformed Bearer header is handled safely")
    void testMalformedBearerHeader_HandledSafely() throws Exception {
        // Just "Bearer " with no token
        mockMvc.perform(get("/api/v1/dashboard/me")
                        .header("Authorization", "Bearer "))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));

        // Garbage token
        mockMvc.perform(get("/api/v1/dashboard/me")
                        .header("Authorization", "Bearer not.a.valid.jwt"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));

        // Missing Bearer prefix
        mockMvc.perform(get("/api/v1/dashboard/me")
                        .header("Authorization", "Basic dXNlcjpwYXNz"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("6. Public login and registration endpoints still work")
    void testPublicEndpoints_StillWork() throws Exception {
        // Health endpoint is public and permits all requests (returns non-401)
        mockMvc.perform(get("/actuator/health"))
                .andExpect(result -> org.junit.jupiter.api.Assertions.assertNotEquals(401, result.getResponse().getStatus()));

        // Stale Authorization header on public endpoint does not block request
        mockMvc.perform(post("/api/v1/auth/login")
                        .header("Authorization", "Bearer some.stale.token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"\",\"password\":\"\"}"))
                .andExpect(status().isUnauthorized()) // from BadCredentialsException, not JWT filter block
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    @DisplayName("7. Dashboard endpoint returns expected authenticated response")
    void testDashboardEndpoint_ReturnsAuthenticatedResponse() throws Exception {
        String token = jwtService.generateToken("student@example.com", "USER");

        UserResponse profile = new UserResponse("user-1", "student", "student@example.com", "USER", "dark", Instant.now());
        PointsSummaryResponse points = new PointsSummaryResponse(250, 12, 18);
        LeaderboardResponse leaderboard = new LeaderboardResponse(3, "user-1", "student", 250);

        when(dashboardService.getDashboard("student@example.com"))
                .thenReturn(new DashboardResponse(profile, points, leaderboard));

        mockMvc.perform(get("/api/v1/dashboard/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPoints", is(250)))
                .andExpect(jsonPath("$.solvedQuestions", is(12)))
                .andExpect(jsonPath("$.attemptedQuestions", is(18)))
                .andExpect(jsonPath("$.leaderboardRank", is(3)))
                .andExpect(jsonPath("$.profile.email", is("student@example.com")));
    }

    @Test
    @DisplayName("8. Leaderboard endpoint behaves correctly for authenticated requests")
    void testLeaderboardEndpoint_AuthenticatedRequests() throws Exception {
        String token = jwtService.generateToken("student@example.com", "USER");

        LeaderboardResponse rankEntry = new LeaderboardResponse(1, "user-1", "topcoder", 500);
        when(leaderboardService.getLeaderboardPage(0, 10))
                .thenReturn(new LeaderboardPageResponse(List.of(rankEntry), 0, 10, 1, 1));

        mockMvc.perform(get("/api/v1/leaderboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].username", is("topcoder")))
                .andExpect(jsonPath("$.content[0].totalPoints", is(500)));

        User user = new User();
        user.setId("user-1");
        user.setEmail("student@example.com");
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(user));
        when(leaderboardService.getMyRank("user-1")).thenReturn(rankEntry);

        mockMvc.perform(get("/api/v1/leaderboard/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is("user-1")))
                .andExpect(jsonPath("$.rank", is(1)));
    }

    @Test
    @DisplayName("9. Authenticated user's data cannot be accessed by changing user ID")
    void testAuthenticatedUser_DataBoundToTokenIdentity() throws Exception {
        // Token belongs to userA@example.com
        String tokenUserA = jwtService.generateToken("userA@example.com", "USER");

        User userA = new User();
        userA.setId("user-A-id");
        userA.setEmail("userA@example.com");

        UserResponse profileA = new UserResponse("user-A-id", "userA", "userA@example.com", "USER", "dark", Instant.now());
        PointsSummaryResponse pointsA = new PointsSummaryResponse(100, 5, 8);
        LeaderboardResponse rankA = new LeaderboardResponse(5, "user-A-id", "userA", 100);

        when(dashboardService.getDashboard("userA@example.com"))
                .thenReturn(new DashboardResponse(profileA, pointsA, rankA));

        // Even if an attacker attempts query parameters or headers with userB's id, /api/v1/dashboard/me uses token principal
        mockMvc.perform(get("/api/v1/dashboard/me?userId=user-B-id")
                        .header("Authorization", "Bearer " + tokenUserA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.email", is("userA@example.com")))
                .andExpect(jsonPath("$.profile.id", is("user-A-id")));
    }
}
