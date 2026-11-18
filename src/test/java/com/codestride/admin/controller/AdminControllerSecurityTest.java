package com.codestride.admin.controller;

import com.codestride.admin.dto.AdminStatsResponse;
import com.codestride.admin.service.AdminService;
import com.codestride.config.TestMongoConfig;
import com.codestride.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestMongoConfig.class)
class AdminControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private AdminService adminService;

    @Test
    void testAdminStats_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testAdminStats_WithUserRole_Returns403() throws Exception {
        String userToken = jwtService.generateToken("user@example.com", "USER");

        mockMvc.perform(get("/api/v1/admin/stats")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminStats_WithAdminRole_Returns200() throws Exception {
        String adminToken = jwtService.generateToken("admin@example.com", "ADMIN");
        when(adminService.getStats())
                .thenReturn(new AdminStatsResponse(10, 50, 8, 12, 100, 2500));

        mockMvc.perform(get("/api/v1/admin/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(10))
                .andExpect(jsonPath("$.totalQuestions").value(50));
    }
}
