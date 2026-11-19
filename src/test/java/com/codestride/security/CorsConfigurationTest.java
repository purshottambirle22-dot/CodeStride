package com.codestride.security;

import com.codestride.config.TestMongoConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestMongoConfig.class)
class CorsConfigurationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    @DisplayName("Preflight OPTIONS request from allowed origin returns 200 and CORS headers")
    void preflightRequest_FromAllowedOrigin_Succeeds() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type, Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET,POST,PUT,PATCH,DELETE,OPTIONS"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600"));
    }

    @Test
    @DisplayName("Preflight OPTIONS request from disallowed origin does not return Allow-Origin header")
    void preflightRequest_FromDisallowedOrigin_Fails() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header(HttpHeaders.ORIGIN, "http://unauthorized-domain.com")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    @Test
    @DisplayName("CorsConfigurationSource bean contains expected configuration values")
    void corsConfigurationSource_ContainsExpectedSettings() {
        org.springframework.mock.web.MockHttpServletRequest request =
                new org.springframework.mock.web.MockHttpServletRequest();
        request.setRequestURI("/api/v1/any");

        CorsConfiguration config = corsConfigurationSource.getCorsConfiguration(request);
        assertThat(config).isNotNull();

        // Allowed origins should include local dev defaults
        assertThat(config.getAllowedOrigins()).contains(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
        );

        // Allowed methods
        assertThat(config.getAllowedMethods()).containsExactlyInAnyOrder(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        );

        // Allowed headers
        assertThat(config.getAllowedHeaders()).containsExactly("*");

        // Allow credentials
        assertThat(config.getAllowCredentials()).isFalse();

        // Max age
        assertThat(config.getMaxAge()).isEqualTo(3600L);
    }

    @Test
    @DisplayName("Comma-separated origins with whitespace and empty entries parse correctly")
    void customOrigins_ParsingLogic_WorksAccurately() {
        JwtAuthFilter dummyFilter = new JwtAuthFilter(null);

        // Test custom origins with commas, trimming, and empty entries
        SecurityConfig customConfig = new SecurityConfig(
                dummyFilter,
                "https://codestride.vercel.app, http://localhost:5173,  , https://preview.vercel.app "
        );

        org.springframework.mock.web.MockHttpServletRequest request =
                new org.springframework.mock.web.MockHttpServletRequest();
        request.setRequestURI("/api/v1/test");

        CorsConfiguration config = customConfig.corsConfigurationSource().getCorsConfiguration(request);
        assertThat(config).isNotNull();
        assertThat(config.getAllowedOrigins()).containsExactly(
                "https://codestride.vercel.app",
                "http://localhost:5173",
                "https://preview.vercel.app"
        );
    }

    @Test
    @DisplayName("Null or blank origins fallback to default localhost origins")
    void blankOrigins_FallbackToDefaults() {
        JwtAuthFilter dummyFilter = new JwtAuthFilter(null);

        SecurityConfig nullConfig = new SecurityConfig(dummyFilter, null);
        org.springframework.mock.web.MockHttpServletRequest request =
                new org.springframework.mock.web.MockHttpServletRequest();
        request.setRequestURI("/api/v1/test");

        CorsConfiguration config = nullConfig.corsConfigurationSource().getCorsConfiguration(request);
        assertThat(config).isNotNull();
        assertThat(config.getAllowedOrigins()).containsExactly(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
        );

        SecurityConfig blankConfig = new SecurityConfig(dummyFilter, "   ,  ");
        CorsConfiguration blankCors = blankConfig.corsConfigurationSource().getCorsConfiguration(request);
        assertThat(blankCors).isNotNull();
        assertThat(blankCors.getAllowedOrigins()).containsExactly(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
        );
    }
}
